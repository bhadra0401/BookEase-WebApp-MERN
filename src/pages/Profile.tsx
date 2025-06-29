import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
  name: user?.name || '',
  email: user?.email || '',
  phone: user?.phone || '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  address: {
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India'
  }
});


  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
    toast.error("New password and confirm password do not match");
    return;
  }

  const payload: any = {
    name: formData.name,
    phone: formData.phone,
    address: formData.address
  };

  if (formData.email !== user?.email) payload.email = formData.email;
  if (formData.currentPassword && formData.newPassword) {
    payload.currentPassword = formData.currentPassword;
    payload.newPassword = formData.newPassword;
  }

  updateProfileMutation.mutate(payload);
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  if (name.includes('address.')) {
    const addressField = name.split('.')[1];
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        [addressField]: value
      }
    });
  } else {
    setFormData({
      ...formData,
      [name]: value
    });
  }
};


  const handleCancel = () => {
  setFormData({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'India'
    }
  });
  setIsEditing(false);
};


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-8">
          <div className="flex items-center">
            <div className="bg-white rounded-full p-3">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <p className="text-blue-100">{user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={updateProfileMutation.isPending}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 mr-2" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user?.name}</p>
                )}
              </div>

              <div>
  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
    <Mail className="h-4 w-4 mr-2" />
    Email Address
  </label>
  {isEditing ? (
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
  ) : (
    <>
      <p className="text-gray-900 py-2">{user?.email}</p>
      <p className="text-xs text-gray-500">Email cannot be changed</p>
    </>
  )}
</div>


              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user?.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Role
                </label>
                <p className="text-gray-900 py-2 capitalize">{user?.role}</p>
                {user?.role === 'seller' && (
                  <p className={`text-xs ${user?.isApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user?.isApproved ? 'Approved Seller' : 'Pending Approval'}
                  </p>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                Address Information
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Street Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user?.address?.street || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user?.address?.city || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user?.address?.state || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">ZIP Code</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user?.address?.zipCode || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Country</label>
                  <p className="text-gray-900 py-2">{user?.address?.country || 'India'}</p>
                </div>
                {isEditing && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">Change Password</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Current Password</label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">New Password</label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
)}

              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;