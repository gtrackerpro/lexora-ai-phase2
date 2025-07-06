import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  User,
  Upload,
  Image,
  Mic,
  Check,
  X,
  Loader2,
  Camera,
  Volume2,
  Save,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { assetsAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';
import Layout from '../components/Layout/Layout';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Asset {
  _id: string;
  type: 'avatar' | 'audio' | 'video' | 'script';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

const ProfileSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'avatar' | 'voice'>('profile');
  const [avatars, setAvatars] = useState<Asset[]>([]);
  const [voices, setVoices] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(user?.avatarId || '');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(user?.voiceId || '');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || ''
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        displayName: user.displayName,
        email: user.email
      });
      setSelectedAvatarId(user.avatarId || '');
      setSelectedVoiceId(user.voiceId || '');
    }
  }, [user, reset]);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const [avatarResponse, voiceResponse] = await Promise.all([
        assetsAPI.getAll('avatar'),
        assetsAPI.getAll('audio')
      ]);

      if (avatarResponse.success) {
        setAvatars(avatarResponse.assets);
      }
      if (voiceResponse.success) {
        setVoices(voiceResponse.assets);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      toast.error('Failed to load assets');
    }
  };

  const handleFileUpload = async (file: File, type: 'avatar' | 'audio') => {
    if (!file) return;

    // Validate file type
    const validAvatarTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const validAudioTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg'];
    
    if (type === 'avatar' && !validAvatarTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }
    
    if (type === 'audio' && !validAudioTypes.includes(file.type)) {
      toast.error('Please upload a valid audio file (MP3 or WAV)');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await assetsAPI.upload(formData);
      if (response.success) {
        toast.success(`${type === 'avatar' ? 'Avatar' : 'Voice'} uploaded successfully!`);
        await fetchAssets(); // Refresh assets list
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      // Update user preferences with selected assets
      const preferences = {
        ...user?.preferences,
        avatarId: selectedAvatarId,
        voiceId: selectedVoiceId
      };

      const response = await authAPI.updatePreferences(preferences);
      if (response.success) {
        updateUser(response.user);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAsset = async (assetId: string, type: 'avatar' | 'audio') => {
    try {
      await assetsAPI.delete(assetId);
      toast.success(`${type === 'avatar' ? 'Avatar' : 'Voice'} deleted successfully`);
      await fetchAssets();
      
      // Clear selection if deleted asset was selected
      if (type === 'avatar' && selectedAvatarId === assetId) {
        setSelectedAvatarId('');
      }
      if (type === 'audio' && selectedVoiceId === assetId) {
        setSelectedVoiceId('');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete asset');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'avatar', label: 'Avatar', icon: Camera },
    { id: 'voice', label: 'Voice', icon: Volume2 }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-dark-400 mt-2">Manage your account and preferences</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <div className="flex space-x-1 bg-dark-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="h-5 w-5 text-primary-400" />
              <h3 className="text-lg font-semibold text-white">Profile Information</h3>
            </div>

            <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Display Name
                  </label>
                  <input
                    {...register('displayName')}
                    type="text"
                    className="input-field w-full"
                    placeholder="Enter your display name"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-error-400">{errors.displayName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="input-field w-full"
                    placeholder="Enter your email"
                    disabled
                  />
                  <p className="mt-1 text-xs text-dark-400">Email cannot be changed</p>
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-400">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Learning Style
                  </label>
                  <select className="input-field w-full">
                    <option value="visual">Visual</option>
                    <option value="auditory">Auditory</option>
                    <option value="kinesthetic">Kinesthetic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Voice Preference
                  </label>
                  <select className="input-field w-full">
                    <option value="neutral">Neutral</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving || !isDirty}
                  className="btn-primary px-6 py-3 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'avatar' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-primary-400" />
                <h3 className="text-lg font-semibold text-white">Avatar Management</h3>
              </div>
              <label className="btn-primary px-4 py-2 cursor-pointer flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>{uploading ? 'Uploading...' : 'Upload Avatar'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'avatar');
                  }}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {avatars.map((avatar) => (
                <motion.div
                  key={avatar._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative group bg-dark-800 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedAvatarId === avatar._id
                      ? 'border-primary-500 shadow-glow'
                      : 'border-dark-700 hover:border-dark-600'
                  }`}
                >
                  <div className="aspect-square">
                    <img
                      src={avatar.fileUrl}
                      alt={avatar.fileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setSelectedAvatarId(avatar._id)}
                      className={`p-2 rounded-full transition-colors ${
                        selectedAvatarId === avatar._id
                          ? 'bg-primary-600 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(avatar._id, 'avatar')}
                      className="p-2 bg-error-600 text-white rounded-full hover:bg-error-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {selectedAvatarId === avatar._id && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-primary-600 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    </div>
                  )}

                  <div className="p-3">
                    <p className="text-white text-sm font-medium truncate">{avatar.fileName}</p>
                    <p className="text-dark-400 text-xs">{formatFileSize(avatar.fileSize)}</p>
                  </div>
                </motion.div>
              ))}

              {avatars.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Image className="h-12 w-12 text-dark-600 mx-auto mb-4" />
                  <p className="text-dark-400">No avatars uploaded yet</p>
                  <p className="text-dark-500 text-sm">Upload an image to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="h-5 w-5 text-primary-400" />
                <h3 className="text-lg font-semibold text-white">Voice Management</h3>
              </div>
              <label className="btn-primary px-4 py-2 cursor-pointer flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>{uploading ? 'Uploading...' : 'Upload Voice'}</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'audio');
                  }}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {voices.map((voice) => (
                <motion.div
                  key={voice._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative group bg-dark-800 rounded-xl p-4 border-2 transition-all duration-200 ${
                    selectedVoiceId === voice._id
                      ? 'border-primary-500 shadow-glow'
                      : 'border-dark-700 hover:border-dark-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl">
                      <Mic className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium truncate">{voice.fileName}</p>
                      <p className="text-dark-400 text-sm">{formatFileSize(voice.fileSize)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <audio controls className="flex-1 max-w-xs">
                      <source src={voice.fileUrl} type={voice.mimeType} />
                      Your browser does not support the audio element.
                    </audio>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedVoiceId(voice._id)}
                        className={`p-2 rounded-full transition-colors ${
                          selectedVoiceId === voice._id
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-700 text-dark-400 hover:bg-dark-600 hover:text-white'
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(voice._id, 'audio')}
                        className="p-2 bg-error-600 text-white rounded-full hover:bg-error-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {selectedVoiceId === voice._id && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-primary-600 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {voices.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Mic className="h-12 w-12 text-dark-600 mx-auto mb-4" />
                  <p className="text-dark-400">No voice samples uploaded yet</p>
                  <p className="text-dark-500 text-sm">Upload an audio file to get started</p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Save Button for Asset Selection */}
      {(activeTab === 'avatar' || activeTab === 'voice') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end"
        >
          <button
            onClick={() => handleProfileSubmit({ displayName: user?.displayName || '', email: user?.email || '' })}
            disabled={saving}
            className="btn-primary px-6 py-3 flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Selection</span>
              </>
            )}
          </button>
        </motion.div>
      )}
      </div>
    </Layout>
  );
};

export default ProfileSettings;