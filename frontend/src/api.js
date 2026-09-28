const API_URL = 'http://localhost:4000/'

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'Something went wrong');
  }

  return data;
};

export const getProducts = async () => {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) {throw new Error('Failed to fetch products');}
  return handleResponse(response);

};

export const createProduct = async (product) => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {throw new Error('Failed to create product');}
  return handleResponse(response);
};

export const updateProduct = async (id, product) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });

    if (!response.ok) throw new Error('Failed to update product');
  return handleResponse(response);
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Failed to delete product');  
};