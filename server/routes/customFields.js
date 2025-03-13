
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all custom fields
router.get('/', async (req, res) => {
  try {
    const [fields] = await pool.query('SELECT * FROM custom_fields ORDER BY name');
    res.json(fields.map(field => ({
      id: field.id,
      name: field.name,
      type: field.type,
      options: field.options ? JSON.parse(field.options) : undefined
    })));
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ error: 'Failed to fetch custom fields' });
  }
});

// Create a new custom field
router.post('/', async (req, res) => {
  const { name, type, options } = req.body;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO custom_fields (name, type, options) VALUES (?, ?, ?)',
      [name, type, options ? JSON.stringify(options) : null]
    );
    
    res.status(201).json({
      id: result.insertId,
      name,
      type,
      options
    });
  } catch (error) {
    console.error('Error creating custom field:', error);
    res.status(500).json({ error: 'Failed to create custom field' });
  }
});

// Delete a custom field
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Start a transaction to ensure data consistency
    await pool.query('START TRANSACTION');
    
    // First delete all values associated with this field
    await pool.query('DELETE FROM customer_field_values WHERE field_id = ?', [id]);
    
    // Then delete the custom field itself
    const [result] = await pool.query('DELETE FROM custom_fields WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Custom field not found' });
    }
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    res.json({ success: true, message: 'Custom field deleted successfully' });
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Error deleting custom field:', error);
    res.status(500).json({ error: 'Failed to delete custom field' });
  }
});

// Update a custom field
router.put('/:id', async (req, res) => {
  const { name, type, options } = req.body;
  
  try {
    await pool.query(
      'UPDATE custom_fields SET name = ?, type = ?, options = ? WHERE id = ?',
      [name, type, options ? JSON.stringify(options) : null, req.params.id]
    );
    
    res.json({
      id: req.params.id,
      name,
      type,
      options
    });
  } catch (error) {
    console.error('Error updating custom field:', error);
    res.status(500).json({ error: 'Failed to update custom field' });
  }
});

// Delete a custom field
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Delete field values
    await connection.query('DELETE FROM customer_field_values WHERE field_id = ?', [req.params.id]);
    
    // Delete field
    await connection.query('DELETE FROM custom_fields WHERE id = ?', [req.params.id]);
    
    await connection.commit();
    
    res.status(204).send();
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting custom field:', error);
    res.status(500).json({ error: 'Failed to delete custom field' });
  } finally {
    connection.release();
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all custom fields
router.get('/', async (req, res) => {
  try {
    const [fields] = await pool.query('SELECT * FROM custom_fields ORDER BY name');
    res.json(fields.map(field => ({
      id: field.id,
      name: field.name,
      type: field.type,
      options: field.options ? JSON.parse(field.options) : null
    })));
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({ error: 'Failed to fetch custom fields' });
  }
});

// Create a new custom field
router.post('/', async (req, res) => {
  const { name, type, options } = req.body;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO custom_fields (name, type, options) VALUES (?, ?, ?)',
      [name, type, options ? JSON.stringify(options) : null]
    );
    
    res.status(201).json({
      id: result.insertId,
      name,
      type,
      options
    });
  } catch (error) {
    console.error('Error creating custom field:', error);
    res.status(500).json({ error: 'Failed to create custom field' });
  }
});

// Delete a custom field
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Start a transaction to ensure data consistency
    await pool.query('START TRANSACTION');
    
    // First delete all values associated with this field
    await pool.query('DELETE FROM customer_field_values WHERE field_id = ?', [id]);
    
    // Then delete the custom field itself
    const [result] = await pool.query('DELETE FROM custom_fields WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Custom field not found' });
    }
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    res.json({ success: true, message: 'Custom field deleted successfully' });
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Error deleting custom field:', error);
    res.status(500).json({ error: 'Failed to delete custom field' });
  }
});

module.exports = router;
