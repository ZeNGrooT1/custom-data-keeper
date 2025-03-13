
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
  
  try {
    const [result] = await pool.query(
      'INSERT INTO custom_fields (name, type, options) VALUES (?, ?, ?)',
      [name, type, options ? JSON.stringify(options) : null]
    );
    
    const [newField] = await pool.query('SELECT * FROM custom_fields WHERE id = ?', [result.insertId]);
    res.status(201).json(newField[0]);
  } catch (error) {
    console.error('Error creating custom field:', error);
    res.status(500).json({ error: 'Failed to create custom field' });
  }
});

// Update a custom field
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, options } = req.body;
  
  try {
    await pool.query(
      'UPDATE custom_fields SET name = ?, type = ?, options = ? WHERE id = ?',
      [name, type, options ? JSON.stringify(options) : null, id]
    );
    
    const [updatedField] = await pool.query('SELECT * FROM custom_fields WHERE id = ?', [id]);
    
    if (updatedField.length === 0) {
      return res.status(404).json({ error: 'Custom field not found' });
    }
    
    res.json(updatedField[0]);
  } catch (error) {
    console.error('Error updating custom field:', error);
    res.status(500).json({ error: 'Failed to update custom field' });
  }
});

// Delete a custom field
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // First delete any field values associated with this field
    await pool.query('DELETE FROM customer_field_values WHERE field_id = ?', [id]);
    
    // Then delete the field itself
    const [result] = await pool.query('DELETE FROM custom_fields WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Custom field not found' });
    }
    
    res.json({ message: 'Custom field deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom field:', error);
    res.status(500).json({ error: 'Failed to delete custom field' });
  }
});

module.exports = router;
