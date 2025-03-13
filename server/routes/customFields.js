
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all custom fields
router.get('/', async (req, res) => {
  try {
    const [fields] = await pool.query('SELECT * FROM custom_fields');
    res.json(fields);
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ error: 'Failed to fetch custom fields' });
  }
});

// Create a new custom field
router.post('/', async (req, res) => {
  const { name, type, options } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  try {
    // Begin transaction
    await pool.query('START TRANSACTION');

    // 1. Insert the field definition into the custom_fields table
    const [result] = await pool.query(
      'INSERT INTO custom_fields (name, type, options) VALUES (?, ?, ?)',
      [name, type, options ? JSON.stringify(options) : null]
    );

    const fieldId = result.insertId;

    // 2. Alter the customers table to add the new column
    const columnName = `custom_${fieldId}`;
    let dataType = 'TEXT';
    if (type === 'number') dataType = 'DECIMAL(10,2)';
    else if (type === 'date') dataType = 'DATE';
    else if (type === 'boolean') dataType = 'BOOLEAN';

    await pool.query(
      `ALTER TABLE customers ADD COLUMN ${columnName} ${dataType}`
    );

    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({ 
      id: fieldId, 
      name, 
      type, 
      options: options || null,
      columnName
    });
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Error creating custom field:', error);
    res.status(500).json({ error: 'Failed to create custom field', details: error.message });
  }
});

// Delete a custom field
router.delete('/:id', async (req, res) => {
  const fieldId = req.params.id;

  try {
    // Begin transaction
    await pool.query('START TRANSACTION');

    // 1. Get the field to make sure it exists
    const [fields] = await pool.query(
      'SELECT * FROM custom_fields WHERE id = ?',
      [fieldId]
    );

    if (fields.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Custom field not found' });
    }

    // 2. Drop the column from the customers table
    const columnName = `custom_${fieldId}`;
    await pool.query(
      `ALTER TABLE customers DROP COLUMN ${columnName}`
    );

    // 3. Delete the field from the custom_fields table
    await pool.query(
      'DELETE FROM custom_fields WHERE id = ?',
      [fieldId]
    );

    // Commit transaction
    await pool.query('COMMIT');

    res.json({ message: 'Custom field deleted successfully' });
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Error deleting custom field:', error);
    res.status(500).json({ error: 'Failed to delete custom field', details: error.message });
  }
});

// Update a custom field
router.put('/:id', async (req, res) => {
  const fieldId = req.params.id;
  const { name, type, options } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  try {
    // Begin transaction
    await pool.query('START TRANSACTION');

    // 1. Get the current field to check if type has changed
    const [fields] = await pool.query(
      'SELECT * FROM custom_fields WHERE id = ?',
      [fieldId]
    );

    if (fields.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Custom field not found' });
    }

    const currentField = fields[0];

    // 2. If type has changed, alter the column type
    if (currentField.type !== type) {
      const columnName = `custom_${fieldId}`;
      let dataType = 'TEXT';
      if (type === 'number') dataType = 'DECIMAL(10,2)';
      else if (type === 'date') dataType = 'DATE';
      else if (type === 'boolean') dataType = 'BOOLEAN';

      await pool.query(
        `ALTER TABLE customers MODIFY COLUMN ${columnName} ${dataType}`
      );
    }

    // 3. Update the field in the custom_fields table
    await pool.query(
      'UPDATE custom_fields SET name = ?, type = ?, options = ? WHERE id = ?',
      [name, type, options ? JSON.stringify(options) : null, fieldId]
    );

    // Commit transaction
    await pool.query('COMMIT');

    res.json({ 
      id: fieldId, 
      name, 
      type, 
      options: options || null 
    });
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Error updating custom field:', error);
    res.status(500).json({ error: 'Failed to update custom field', details: error.message });
  }
});

module.exports = router;
