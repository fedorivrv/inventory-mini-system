import { useEffect, useState } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from './api';

const emptyForm = {
  name: '',
  quantity: 0,
  price: 0,
  description: '',
};

const statusLabels = {
  out_of_stock: 'Out of stock',
  low_stock: 'Low stock',
  in_stock: 'In stock',
};

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };  

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      quantity: Number(form.quantity),
      price: Number(form.price),
      description: form.description
    };

    try {
      if (editingId !== null) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      description: product.description || '',
    });    
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }    

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '30px 20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>Products Inventory</h1>

      {error && (
        <div
          style={{
            marginBottom: '20px',
            padding: '10px',
            border: '1px solid #dc2626',
            color: '#dc2626',
            background: '#fef2f2',
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: '30px',
          padding: '20px',
          border: '1px solid #ddd',
        }}
      >
        <h2>{editingId !== null ? 'Edit product' : 'Add product'}</h2>

        <div style={{ marginBottom: '12px' }}>
          <label>
            Name
            <br />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>
            Quantity
            <br />
            <input
              type="number"
              name="quantity"
              min="0"
              value={form.quantity}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>
            Price
            <br />
            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>
            Description
            <br />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              style={{
                ...inputStyle,
                resize: 'vertical',
              }}
            />
          </label>
        </div>

        <button type="submit" disabled={saving}>
          {saving
            ? 'Saving...'
            : editingId !== null
              ? 'Update product'
              : 'Add product'}
        </button>

        {editingId !== null && (
          <button
            type="button"
            onClick={resetForm}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th style={cellStyle}>Name</th>
              <th style={cellStyle}>Quantity</th>
              <th style={cellStyle}>Price</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={cellStyle}>{product.name}</td>

                <td style={cellStyle}>{product.quantity}</td>

                <td style={cellStyle}>
                  ${Number(product.price).toFixed(2)}
                </td>

                <td style={cellStyle}>
                  {statusLabels[product.status] || product.status}
                </td>

                <td style={cellStyle}>
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    style={{ marginLeft: '8px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  maxWidth: '400px',
  padding: '8px',
  marginTop: '4px',
  boxSizing: 'border-box',
};

const cellStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  textAlign: 'left',
};

export default App;