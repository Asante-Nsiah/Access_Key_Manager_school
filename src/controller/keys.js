const pool = require("./../db");
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const crypto = require('crypto');

function generateAccessKey() {
    const key = crypto.randomBytes(16).toString('hex');
    return key;
  }

revokeKey = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query('UPDATE keys SET revoked_at = NOW() WHERE key_id = $1 AND revoked_at IS NULL', [id]);
      if (result.rowCount === 0) {
        res.status(404).send({ message: 'Key not found or already revoked' });
      } else {
        await client.query('COMMIT');
        res.send({ message: 'Key revoked successfully' });
      }
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).send({ message: 'Error revoking key' });
    } finally {
      client.release();
    }
  };
  
  keys = async (req, res) => {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT key_id, key_value, created_at, expires_at, revoked_at FROM keys');
      res.send(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Error getting keys' });
    } finally {
      client.release();
    }
  };
  
  const fetchKeys = async () => {
    try {
      const response = await fetch('/keys');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  };
  
  const populateTable = async () => {
    const keys = await fetchKeys();
  
    const dom = new JSDOM(`<!DOCTYPE html><html><body><table id="key-list"><tbody></tbody></table></body></html>`);
    const document = dom.window.document;
  
    const tableBody = document.querySelector('#key-list tbody');
  
    if (Array.isArray(keys)) {
      keys.forEach((key) => {
        const row = document.createElement('tr');
  
        const keyCell = document.createElement('td');
        keyCell.textContent = key.key;
        row.appendChild(keyCell);
  
        const userCell = document.createElement('td');
        userCell.textContent = key.user_email;
        row.appendChild(userCell);
  
        const statusCell = document.createElement('td');
        statusCell.textContent = key.status;
  
        if (key.status === 'active') {
          statusCell.classList.add('active');
        } else if (key.status === 'expired') {
          statusCell.classList.add('expired');
        } else if (key.status === 'revoked') {
          statusCell.classList.add('revoked');
        }
  
        row.appendChild(statusCell);
  
        const procurementCell = document.createElement('td');
        procurementCell.textContent = key.procurement_date;
        row.appendChild(procurementCell);
  
        const expiryCell = document.createElement('td');
        expiryCell.textContent = key.expiry_date;
        row.appendChild(expiryCell);
  
        tableBody.appendChild(row);
      });
    } else {
      console.error('Keys data is not an array');
    }
  
    console.log(dom.serialize());
  };
  
  populateTable();

//   module.exports = { keys, revokeKey, populateTable };