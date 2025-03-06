
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const pool = require('../db');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const [customers] = await pool.query(`
      SELECT c.*, 
             JSON_OBJECTAGG(IFNULL(cf.name, ''), IFNULL(cfv.value, '')) as custom_fields
      FROM customers c
      LEFT JOIN customer_field_values cfv ON c.id = cfv.customer_id
      LEFT JOIN custom_fields cf ON cfv.field_id = cf.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    
    // Format the results
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      dob: customer.dob,
      phone: customer.phone,
      email: customer.email,
      occupation: customer.occupation,
      location: customer.location,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      customFields: customer.custom_fields ? JSON.parse(customer.custom_fields) : {}
    }));
    
    res.json(formattedCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get a single customer
router.get('/:id', async (req, res) => {
  try {
    const [customer] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get custom field values
    const [fieldValues] = await pool.query(`
      SELECT cf.id, cf.name, cf.type, cfv.value
      FROM customer_field_values cfv
      JOIN custom_fields cf ON cfv.field_id = cf.id
      WHERE cfv.customer_id = ?
    `, [req.params.id]);
    
    const customFields = fieldValues.map(field => ({
      id: field.id,
      name: field.name,
      type: field.type,
      value: field.value
    }));
    
    res.json({
      ...customer[0],
      customFields
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create a new customer
router.post('/', async (req, res) => {
  const { name, dob, phone, email, occupation, location, customFields } = req.body;
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Insert customer
    const [result] = await connection.query(
      'INSERT INTO customers (name, dob, phone, email, occupation, location) VALUES (?, ?, ?, ?, ?, ?)',
      [name, dob, phone, email, occupation, location]
    );
    
    const customerId = result.insertId;
    
    // Insert custom field values
    if (customFields && customFields.length > 0) {
      const fieldValues = customFields.map(field => [customerId, field.id, field.value]);
      await connection.query(
        'INSERT INTO customer_field_values (customer_id, field_id, value) VALUES ?',
        [fieldValues]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({
      id: customerId,
      name,
      dob,
      phone,
      email,
      occupation,
      location,
      customFields,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  } finally {
    connection.release();
  }
});

// Update a customer
router.put('/:id', async (req, res) => {
  const { name, dob, phone, email, occupation, location, customFields } = req.body;
  const customerId = req.params.id;
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Update customer
    await connection.query(
      'UPDATE customers SET name = ?, dob = ?, phone = ?, email = ?, occupation = ?, location = ?, updated_at = NOW() WHERE id = ?',
      [name, dob, phone, email, occupation, location, customerId]
    );
    
    // Delete existing custom field values
    await connection.query('DELETE FROM customer_field_values WHERE customer_id = ?', [customerId]);
    
    // Insert new custom field values
    if (customFields && customFields.length > 0) {
      const fieldValues = customFields.map(field => [customerId, field.id, field.value]);
      await connection.query(
        'INSERT INTO customer_field_values (customer_id, field_id, value) VALUES ?',
        [fieldValues]
      );
    }
    
    await connection.commit();
    
    res.json({
      id: customerId,
      name,
      dob,
      phone,
      email,
      occupation,
      location,
      customFields,
      updatedAt: new Date()
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  } finally {
    connection.release();
  }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Delete custom field values
    await connection.query('DELETE FROM customer_field_values WHERE customer_id = ?', [req.params.id]);
    
    // Delete customer
    await connection.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    
    await connection.commit();
    
    res.status(204).send();
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  } finally {
    connection.release();
  }
});

// Search customers
router.get('/search/:query', async (req, res) => {
  const searchQuery = `%${req.params.query}%`;
  
  try {
    const [customers] = await pool.query(`
      SELECT c.*, 
             JSON_OBJECTAGG(IFNULL(cf.name, ''), IFNULL(cfv.value, '')) as custom_fields
      FROM customers c
      LEFT JOIN customer_field_values cfv ON c.id = cfv.customer_id
      LEFT JOIN custom_fields cf ON cfv.field_id = cf.id
      WHERE c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [searchQuery, searchQuery, searchQuery]);
    
    // Format the results
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      dob: customer.dob,
      phone: customer.phone,
      email: customer.email,
      occupation: customer.occupation,
      location: customer.location,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      customFields: customer.custom_fields ? JSON.parse(customer.custom_fields) : {}
    }));
    
    res.json(formattedCustomers);
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ error: 'Failed to search customers' });
  }
});

module.exports = router;
