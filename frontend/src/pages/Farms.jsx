// src/pages/Farms.jsx
import { useState, useEffect } from 'react';
import { getFarms, getFarm, createFarm, updateFarm, deleteFarm } from '../services/farmService';
import { format, parseISO } from 'date-fns';

function Farms() {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area_hectares: 1,
    crops: []
  });
  const [cropFormData, setCropFormData] = useState({
    name: 'Maize',
    area_hectares: 0.5,
    planting_date: format(new Date(), 'yyyy-MM-dd'),
    expected_harvest_date: format(new Date(new Date().setMonth(new Date().getMonth() + 4)), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const data = await getFarms();
      setFarms(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching farms:', err);
      setError('Failed to load farms. Please try again later.');
      setLoading(false);
    }
  };

  const handleSelectFarm = async (farmId) => {
    try {
      const farm = await getFarm(farmId);
      setSelectedFarm(farm);
      setIsEditing(false);
      setIsCreating(false);
    } catch (err) {
      console.error('Error fetching farm details:', err);
      setError('Failed to load farm details.');
    }
  };

  const handleCreateNew = () => {
    setSelectedFarm(null);
    setIsEditing(false);
    setIsCreating(true);
    setFormData({
      name: '',
      location: '',
      area_hectares: 1,
      crops: []
    });
  };

  const handleEdit = () => {
    if (!selectedFarm) return;

    setFormData({
      name: selectedFarm.name,
      location: selectedFarm.location,
      area_hectares: selectedFarm.area_hectares,
      crops: [...selectedFarm.crops]
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleDelete = async () => {
    if (!selectedFarm) return;

    if (window.confirm(`Are you sure you want to delete ${selectedFarm.name}?`)) {
      try {
        await deleteFarm(selectedFarm._id);
        setSelectedFarm(null);
        fetchFarms();
      } catch (err) {
        console.error('Error deleting farm:', err);
        setError('Failed to delete farm.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'area_hectares' ? parseFloat(value) : value
    });
  };

  const handleCropInputChange = (e) => {
    const { name, value } = e.target;
    setCropFormData({
      ...cropFormData,
      [name]: name === 'area_hectares' ? parseFloat(value) : value
    });
  };

  const handleAddCrop = () => {
    setFormData({
      ...formData,
      crops: [...formData.crops, { ...cropFormData }]
    });

    // Reset crop form
    setCropFormData({
      name: 'Maize',
      area_hectares: 0.5,
      planting_date: format(new Date(), 'yyyy-MM-dd'),
      expected_harvest_date: format(new Date(new Date().setMonth(new Date().getMonth() + 4)), 'yyyy-MM-dd')
    });
  };

  const handleRemoveCrop = (index) => {
    const updatedCrops = [...formData.crops];
    updatedCrops.splice(index, 1);
    setFormData({
      ...formData,
      crops: updatedCrops
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isCreating) {
        // Create new farm
        await createFarm({
          farmer_id: 'farmer-001', // In a real app, this would be the logged-in farmer's ID
          ...formData
        });
      } else if (isEditing && selectedFarm) {
        // Update existing farm
        await updateFarm(selectedFarm._id, formData);
      }

      // Refresh farms and clear form
      fetchFarms();
      setIsEditing(false);
      setIsCreating(false);
    } catch (err) {
      console.error('Error saving farm:', err);
      setError('Failed to save farm data.');
    }
  };

  const calculateTotalCropArea = (crops) => {
    return crops.reduce((total, crop) => total + crop.area_hectares, 0);
  };

  return (
    <div>
      <h1>Farm Management</h1>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ width: '250px' }}>
          <div className="card">
            <h3>My Farms</h3>

            {loading ? (
              <div className="loading" style={{ height: '100px' }}>Loading farms...</div>
            ) : error ? (
              <div style={{ color: '#ef4444', marginTop: '15px' }}>{error}</div>
            ) : farms.length === 0 ? (
              <p style={{ marginTop: '15px' }}>No farms found. Create your first farm.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
                {farms.map(farm => (
                  <li
                    key={farm._id}
                    onClick={() => handleSelectFarm(farm._id)}
                    style={{
                      padding: '10px',
                      marginBottom: '5px',
                      cursor: 'pointer',
                      backgroundColor: selectedFarm && selectedFarm._id === farm._id ? '#f0f9ff' : 'transparent',
                      borderRadius: '4px'
                    }}
                  >
                    <div style={{ fontWeight: 'bold' }}>{farm.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {farm.area_hectares} hectares
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              className="btn"
              onClick={handleCreateNew}
              style={{ width: '100%', marginTop: '15px' }}
            >
              Add New Farm
            </button>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {isCreating ? (
            <div className="card">
              <h3>Add New Farm</h3>

              <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    Farm Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Main Farm"
                    style={{ width: '100%', padding: '8px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Nairobi East"
                    style={{ width: '100%', padding: '8px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    Total Area (hectares)
                  </label>
                  <input
                    type="number"
                    name="area_hectares"
                    value={formData.area_hectares}
                    onChange={handleInputChange}
                    min="0.1"
                    step="0.1"
                    style={{ width: '100%', padding: '8px' }}
                    required
                  />
                </div>

                <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Crops</h4>

                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Crop Type
                    </label>
                    <select
                      name="name"
                      value={cropFormData.name}
                      onChange={handleCropInputChange}
                      style={{ width: '100%', padding: '8px' }}
                    >
                      <option value="Maize">Maize</option>
                      <option value="Beans">Beans</option>
                      <option value="Tomatoes">Tomatoes</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Rice">Rice</option>
                      <option value="Potatoes">Potatoes</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Area (hectares)
                    </label>
                    <input
                      type="number"
                      name="area_hectares"
                      value={cropFormData.area_hectares}
                      onChange={handleCropInputChange}
                      min="0.1"
                      step="0.1"
                      style={{ width: '100%', padding: '8px' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Planting Date
                    </label>
                    <input
                      type="date"
                      name="planting_date"
                      value={cropFormData.planting_date}
                      onChange={handleCropInputChange}
                      style={{ width: '100%', padding: '8px' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Expected Harvest Date
                    </label>
                    <input
                      type="date"
                      name="expected_harvest_date"
                      value={cropFormData.expected_harvest_date}
                      onChange={handleCropInputChange}
                      style={{ width: '100%', padding: '8px' }}
                      required
                    />
                  </div>

                  <button
                    type="button"
                    className="btn"
                    onClick={handleAddCrop}
                    style={{ width: '100%' }}
                  >
                    Add Crop
                  </button>
                </div>

                {formData.crops.length > 0 ? (
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ marginBottom: '10px' }}>Crops to Add:</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Type</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Area (ha)</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Planting Date</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Harvest Date</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.crops.map((crop, index) => (
                          <tr key={index}>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{crop.name}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{crop.area_hectares}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{crop.planting_date}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{crop.expected_harvest_date}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveCrop(index)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer'
                                }}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                      Total Crop Area: {calculateTotalCropArea(formData.crops)} hectares
                    </div>
                    {calculateTotalCropArea(formData.crops) > formData.area_hectares && (
                      <div style={{ color: '#ef4444', marginTop: '5px' }}>
                        Warning: Total crop area exceeds farm area!
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ marginBottom: '20px', color: '#6b7280' }}>No crops added yet.</p>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    className="btn"
                    disabled={calculateTotalCropArea(formData.crops) > formData.area_hectares}
                  >
                    Create Farm
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setIsCreating(false)}
                    style={{ backgroundColor: '#6b7280' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : isEditing && selectedFarm ? (
            <div className="card">
              <h3>Edit Farm</h3>

              <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    Farm Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    Total Area (hectares)
                  </label>
                  <input
                    type="number"
                    name="area_hectares"
                    value={formData.area_hectares}
                    onChange={handleInputChange}
                    min="0.1"
                    step="0.1"
                    style={{ width: '100%', padding: '8px' }}
                    required
                  />
                </div>

                <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Crops</h4>

                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Crop Type
                    </label>
                    <select
                      name="name"
                      value={cropFormData.name}
                      onChange={handleCropInputChange}
                      style={{ width: '100%', padding: '8px' }}
                    >
                      <option value="Maize">Maize</option>
                      <option value="Beans">Beans</option>
                      <option value="Tomatoes">Tomatoes</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Rice">Rice</option>
                      <option value="Potatoes">Potatoes</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Area (hectares)
                    </label>
                    <input
                      type="number"
                      name="area_hectares"
                      value={cropFormData.area_hectares}
                      onChange={handleCropInputChange}
                      min="0.1"
                      step="0.1"
                      style={{ width: '100%', padding: '8px' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Planting Date
                    </label>
                    <input
                      type="date"
                      name="planting_date"
                      value={cropFormData.planting_date}
                      onChange={handleCropInputChange}
                      style={{ width: '100%', padding: '8px' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Expected Harvest Date
                    </label>
                    <input
                      type="date"
                      name="expected_harvest_date"
                      value={cropFormData.expected_harvest_date}
                      onChange={handleCropInputChange}
                      style={{ width: '100%', padding: '8px' }}
                      required
                    />
                  </div>

                  <button
                    type="button"
                    className="btn"
                    onClick={handleAddCrop}
                    style={{ width: '100%' }}
                  >
                    Add Crop
                  </button>
                </div>

                {formData.crops.length > 0 ? (
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ marginBottom: '10px' }}>Current Crops:</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Type</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Area (ha)</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Planting Date</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Harvest Date</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.crops.map((crop, index) => (
                          <tr key={index}>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{crop.name}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{crop.area_hectares}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{crop.planting_date}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{crop.expected_harvest_date}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveCrop(index)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer'
                                }}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                      Total Crop Area: {calculateTotalCropArea(formData.crops)} hectares
                    </div>
                    {calculateTotalCropArea(formData.crops) > formData.area_hectares && (
                      <div style={{ color: '#ef4444', marginTop: '5px' }}>
                        Warning: Total crop area exceeds farm area!
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ marginBottom: '20px', color: '#6b7280' }}>No crops added yet.</p>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    className="btn"
                    disabled={calculateTotalCropArea(formData.crops) > formData.area_hectares}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setIsEditing(false)}
                    style={{ backgroundColor: '#6b7280' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : selectedFarm ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{selectedFarm.name}</h3>
                <div>
                  <button
                    className="btn"
                    onClick={handleEdit}
                    style={{ marginRight: '10px' }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn"
                    onClick={handleDelete}
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
                  <div>
                    <strong>Location:</strong> {selectedFarm.location}
                  </div>
                  <div>
                    <strong>Total Area:</strong> {selectedFarm.area_hectares} hectares
                  </div>
                  <div>
                    <strong>Created:</strong> {format(parseISO(selectedFarm.created_at), 'MMM d, yyyy')}
                  </div>
                  <div>
                    <strong>Last Updated:</strong> {format(parseISO(selectedFarm.updated_at), 'MMM d, yyyy')}
                  </div>
                </div>

                <h4>Crops</h4>
                {selectedFarm.crops.length === 0 ? (
                  <p style={{ marginTop: '10px', color: '#6b7280' }}>No crops planted on this farm.</p>
                ) : (
                  <div style={{ marginTop: '10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Crop</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Area (ha)</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Planting Date</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Harvest Date</th>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedFarm.crops.map((crop, index) => {
                          const plantingDate = parseISO(crop.planting_date);
                          const harvestDate = parseISO(crop.expected_harvest_date);
                          const today = new Date();

                          let status;
                          if (today < plantingDate) {
                            status = "Scheduled";
                          } else if (today > harvestDate) {
                            status = "Harvested";
                          } else {
                            // Calculate progress percentage
                            const totalDays = (harvestDate - plantingDate) / (1000 * 60 * 60 * 24);
                            const daysPassed = (today - plantingDate) / (1000 * 60 * 60 * 24);
                            const progress = Math.floor((daysPassed / totalDays) * 100);

                            status = `Growing (${progress}%)`;
                          }

                          return (
                            <tr key={index}>
                              <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{crop.name}</td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>{crop.area_hectares}</td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                                {format(plantingDate, 'MMM d, yyyy')}
                              </td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                                {format(harvestDate, 'MMM d, yyyy')}
                              </td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  backgroundColor: status.includes('Growing') ? '#10b981' :
                                    status === 'Scheduled' ? '#3b82f6' : '#6b7280',
                                  color: 'white'
                                }}>
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <div style={{ marginTop: '15px' }}>
                      <strong>Total Crop Area:</strong> {calculateTotalCropArea(selectedFarm.crops)} hectares
                      {calculateTotalCropArea(selectedFarm.crops) > selectedFarm.area_hectares && (
                        <span style={{ color: '#ef4444', marginLeft: '10px' }}>
                          (Exceeds farm area)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '20px' }}>
                  <h4>Farm Dashboard</h4>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '15px',
                    borderRadius: '8px',
                    marginTop: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                      <div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>Land Utilization</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                          {calculateTotalCropArea(selectedFarm.crops) > 0
                            ? `${Math.min(100, Math.round((calculateTotalCropArea(selectedFarm.crops) / selectedFarm.area_hectares) * 100))}%`
                            : '0%'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>Crop Diversity</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                          {selectedFarm.crops.length} types
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>Next Harvest</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {selectedFarm.crops.length > 0
                            ? format(parseISO(selectedFarm.crops.reduce((earliest, crop) => {
                              const currentDate = new Date();
                              const harvestDate = parseISO(crop.expected_harvest_date);
                              return (harvestDate > currentDate && (!earliest || harvestDate < parseISO(earliest)))
                                ? crop.expected_harvest_date
                                : earliest;
                            }, null) || new Date().toISOString()), 'MMM d, yyyy')
                            : 'No crops planted'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <button
                        className="btn"
                        onClick={() => window.location.href = '/yield'}
                        style={{ marginRight: '10px' }}
                      >
                        Predict Yield
                      </button>
                      <button
                        className="btn"
                        onClick={() => window.location.href = '/irrigation'}
                      >
                        Irrigation Schedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <h3>Farm Management</h3>
              <p style={{ marginTop: '15px' }}>
                Select a farm from the list or create a new one to get started.
              </p>
              <div style={{ marginTop: '20px' }}>
                <button
                  className="btn"
                  onClick={handleCreateNew}
                >
                  Add New Farm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>About Farm Management</h3>
        <p style={{ marginTop: '10px' }}>
          The Farm Management module allows you to track multiple farms and their crops.
          By maintaining accurate farm records, you can:
        </p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Monitor crop cycles and harvest schedules</li>
          <li>Generate targeted recommendations for each farm</li>
          <li>Track land utilization and crop diversity</li>
          <li>Plan irrigation and pest control activities more effectively</li>
        </ul>
      </div>
    </div>
  );
}

export default Farms;