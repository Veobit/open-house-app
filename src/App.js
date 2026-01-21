import React, { useState, useEffect } from 'react';
import { Home, UserPlus, Mail, Phone, User, Lock, Eye, EyeOff, Upload, LogOut, Download, Edit2, Save, X, Trash2, Plus, QrCode, Building } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { db, auth, googleProvider } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';

export default function OpenHouseApp() {
  const [view, setView] = useState('public');
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    doNotCall: '',
    hasAgencyAgreement: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [brokerInfo, setBrokerInfo] = useState({
    brokerName: '',
    companyName: ''
  });
  
  const [settings, setSettings] = useState({
    welcomeMessage: 'Welcome to Our Open House!',
    propertyAddress: '',
    housePhoto: '',
    logo: '',
    realtorPhoto: '',
    emailTemplate: `Thank you for registering for our open house! We look forward to seeing you!

Property Details:
Date: [DATE]
Time: [TIME]
Address: [ADDRESS]

Best regards,
[REALTOR_NAME]`,
    realtorEmail: 'realtor@example.com',
    realtorName: 'Your Realtor'
  });
  const [editSettings, setEditSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [guests, setGuests] = useState([]);
  const [imagePreview, setImagePreview] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [realtorPhotoPreview, setRealtorPhotoPreview] = useState('');
  const [saveConfirmation, setSaveConfirmation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [guestFormData, setGuestFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    doNotCall: '',
    hasAgencyAgreement: '',
    brokerName: '',
    companyName: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [realtorId, setRealtorId] = useState(null);
  const [properties, setProperties] = useState([]);
  const [activePropertyId, setActivePropertyId] = useState(null);
  const [propertyId, setPropertyId] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showManagePropertiesModal, setShowManagePropertiesModal] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [creatingProperty, setCreatingProperty] = useState(false);
  const [deletingPropertyId, setDeletingPropertyId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const rId = urlParams.get('r');
    const pId = urlParams.get('p');
    if (rId) {
      setRealtorId(rId);
      if (pId) {
        setPropertyId(pId);
        loadRealtorPropertySettings(rId, pId);
      } else {
        loadRealtorFirstProperty(rId);
      }
    }
  }, []);

  const loadRealtorPropertySettings = async (rId, propId) => {
    try {
      const settingsDoc = await getDoc(doc(db, 'users', rId, 'properties', propId, 'settings', 'appSettings'));
      if (settingsDoc.exists()) {
        const loadedSettings = settingsDoc.data();
        setSettings(loadedSettings);
        setImagePreview(loadedSettings.housePhoto || '');
        setLogoPreview(loadedSettings.logo || '');
        setRealtorPhotoPreview(loadedSettings.realtorPhoto || '');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading property settings:', error);
      setLoading(false);
    }
  };

  const loadRealtorFirstProperty = async (rId) => {
    try {
      const propertiesSnapshot = await getDocs(collection(db, 'users', rId, 'properties'));
      if (!propertiesSnapshot.empty) {
        const firstProperty = propertiesSnapshot.docs[0];
        setPropertyId(firstProperty.id);
        const settingsDoc = await getDoc(doc(db, 'users', rId, 'properties', firstProperty.id, 'settings', 'appSettings'));
        if (settingsDoc.exists()) {
          const loadedSettings = settingsDoc.data();
          setSettings(loadedSettings);
          setImagePreview(loadedSettings.housePhoto || '');
          setLogoPreview(loadedSettings.logo || '');
          setRealtorPhotoPreview(loadedSettings.realtorPhoto || '');
        }
      } else {
        const oldSettingsDoc = await getDoc(doc(db, 'users', rId, 'settings', 'appSettings'));
        if (oldSettingsDoc.exists()) {
          const loadedSettings = oldSettingsDoc.data();
          setSettings(loadedSettings);
          setImagePreview(loadedSettings.housePhoto || '');
          setLogoPreview(loadedSettings.logo || '');
          setRealtorPhotoPreview(loadedSettings.realtorPhoto || '');
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading realtor properties:', error);
      setLoading(false);
    }
  };

  const getRegistrationUrl = () => {
    if (typeof window !== 'undefined' && currentUser && activePropertyId) {
      return `${window.location.origin}?r=${currentUser.uid}&p=${activePropertyId}`;
    }
    return 'https://your-app-url.com';
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qr-code-${settings.propertyAddress || 'open-house'}.png`;
      link.href = url;
      link.click();
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setAdminLoggedIn(true);
        loadUserData(user.uid);
      } else {
        setCurrentUser(null);
        setAdminLoggedIn(false);
        setGuests([]);
        setView(currentView => currentView === 'admin' ? 'public' : currentView);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const loadUserData = async (userId) => {
    try {
      const propertiesSnapshot = await getDocs(collection(db, 'users', userId, 'properties'));

      if (!propertiesSnapshot.empty) {
        const propertiesList = propertiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProperties(propertiesList);

        const firstPropertyId = propertiesList[0].id;
        setActivePropertyId(firstPropertyId);

        await loadPropertyData(userId, firstPropertyId);
      } else {
        const oldSettingsDoc = await getDoc(doc(db, 'users', userId, 'settings', 'appSettings'));

        if (oldSettingsDoc.exists()) {
          const oldSettings = oldSettingsDoc.data();
          const propertyName = oldSettings.propertyAddress || 'My First Property';

          const newPropertyRef = await addDoc(collection(db, 'users', userId, 'properties'), {
            name: propertyName,
            createdAt: new Date().toISOString()
          });

          await setDoc(doc(db, 'users', userId, 'properties', newPropertyRef.id, 'settings', 'appSettings'), oldSettings);
          const oldGuestsSnapshot = await getDocs(collection(db, 'users', userId, 'guests'));
          for (const guestDoc of oldGuestsSnapshot.docs) {
            await setDoc(
              doc(db, 'users', userId, 'properties', newPropertyRef.id, 'guests', guestDoc.id),
              guestDoc.data()
            );
          }

          setProperties([{ id: newPropertyRef.id, name: propertyName, createdAt: new Date().toISOString() }]);
          setActivePropertyId(newPropertyRef.id);
          setSettings(oldSettings);
          setTempSettings(oldSettings);
          setImagePreview(oldSettings.housePhoto || '');
          setLogoPreview(oldSettings.logo || '');
          setRealtorPhotoPreview(oldSettings.realtorPhoto || '');

          const guestsList = oldGuestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setGuests(guestsList);
        } else {
          setProperties([]);
          setActivePropertyId(null);
          setGuests([]);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPropertyData = async (userId, propId) => {
    try {
      const property = properties.find(p => p.id === propId);
      const propertyName = property?.name || '';

      const settingsDoc = await getDoc(doc(db, 'users', userId, 'properties', propId, 'settings', 'appSettings'));
      if (settingsDoc.exists()) {
        const loadedSettings = settingsDoc.data();
        if (!loadedSettings.propertyAddress && propertyName) {
          loadedSettings.propertyAddress = propertyName;
        }
        setSettings(loadedSettings);
        setTempSettings(loadedSettings);
        setImagePreview(loadedSettings.housePhoto || '');
        setLogoPreview(loadedSettings.logo || '');
        setRealtorPhotoPreview(loadedSettings.realtorPhoto || '');
      } else {
        const defaultSettings = {
          welcomeMessage: 'Welcome to Our Open House!',
          propertyAddress: propertyName,
          housePhoto: '',
          logo: '',
          realtorPhoto: '',
          emailTemplate: `Thank you for registering for our open house! We look forward to seeing you!

Property Details:
Date: [DATE]
Time: [TIME]
Address: [ADDRESS]

Best regards,
[REALTOR_NAME]`,
          realtorEmail: '',
          realtorName: ''
        };
        setSettings(defaultSettings);
        setTempSettings(defaultSettings);
        setImagePreview('');
        setLogoPreview('');
        setRealtorPhotoPreview('');
      }

      const guestsSnapshot = await getDocs(collection(db, 'users', userId, 'properties', propId, 'guests'));
      const guestsList = guestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGuests(guestsList);
    } catch (error) {
      console.error('Error loading property data:', error);
    }
  };

  const switchProperty = async (propId) => {
    if (propId === activePropertyId) return;
    setActivePropertyId(propId);
    if (currentUser) {
      await loadPropertyData(currentUser.uid, propId);
    }
  };

  const createProperty = async (name) => {
    if (!currentUser) {
      alert('You must be logged in to create a property.');
      return;
    }
    if (!name.trim()) {
      alert('Please enter a property name.');
      return;
    }

    setCreatingProperty(true);

    try {
      const defaultSettings = {
        welcomeMessage: 'Welcome to Our Open House!',
        propertyAddress: name,
        housePhoto: '',
        logo: settings.logo || '',
        realtorPhoto: settings.realtorPhoto || '',
        emailTemplate: settings.emailTemplate || `Thank you for registering for our open house! We look forward to seeing you!

Property Details:
Date: [DATE]
Time: [TIME]
Address: [ADDRESS]

Best regards,
[REALTOR_NAME]`,
        realtorEmail: settings.realtorEmail || '',
        realtorName: settings.realtorName || ''
      };

      const newPropertyRef = await addDoc(collection(db, 'users', currentUser.uid, 'properties'), {
        name: name,
        createdAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'users', currentUser.uid, 'properties', newPropertyRef.id, 'settings', 'appSettings'), defaultSettings);

      const newProperty = { id: newPropertyRef.id, name: name, createdAt: new Date().toISOString() };
      setProperties([...properties, newProperty]);

      setActivePropertyId(newPropertyRef.id);
      setSettings(defaultSettings);
      setTempSettings(defaultSettings);
      setImagePreview('');
      setGuests([]);

      setShowPropertyModal(false);
      setNewPropertyName('');
      setCreatingProperty(false);

      alert('Property created successfully!');
      return newPropertyRef.id;
    } catch (error) {
      console.error('Error creating property:', error);
      setCreatingProperty(false);
      alert('Error creating property: ' + error.message);
    }
  };

  const deleteProperty = async (propId, skipConfirm = false) => {
    if (!currentUser) {
      alert('You must be logged in.');
      return;
    }

    if (properties.length <= 1) {
      alert('You must have at least one property.');
      return;
    }

    if (!skipConfirm && !window.confirm('Are you sure you want to delete this property? All guests and settings will be permanently deleted.')) {
      return;
    }

    setDeletingPropertyId(propId);

    try {
      const guestsSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'properties', propId, 'guests'));
      for (const guestDoc of guestsSnapshot.docs) {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'properties', propId, 'guests', guestDoc.id));
      }

      await deleteDoc(doc(db, 'users', currentUser.uid, 'properties', propId, 'settings', 'appSettings'));

      await deleteDoc(doc(db, 'users', currentUser.uid, 'properties', propId));

      const updatedProperties = properties.filter(p => p.id !== propId);
      setProperties(updatedProperties);

      if (activePropertyId === propId && updatedProperties.length > 0) {
        await switchProperty(updatedProperties[0].id);
      }

      setDeletingPropertyId(null);
    } catch (error) {
      console.error('Error deleting property:', error);
      setDeletingPropertyId(null);
      alert('Error deleting property: ' + error.message);
    }
  };

  const deleteDuplicateProperties = async () => {
    if (!currentUser || properties.length <= 1) return;

    const confirmDelete = window.confirm(
      `This will delete duplicate properties, keeping only one of each unique address. Continue?`
    );
    if (!confirmDelete) return;

    setDeletingPropertyId('bulk');

    try {
      const propertyGroups = {};
      properties.forEach(p => {
        const name = (p.name || 'Untitled').toLowerCase().trim();
        if (!propertyGroups[name]) {
          propertyGroups[name] = [];
        }
        propertyGroups[name].push(p);
      });

      const toDelete = [];
      Object.values(propertyGroups).forEach(group => {
        if (group.length > 1) {
          toDelete.push(...group.slice(1));
        }
      });

      if (toDelete.length === 0) {
        alert('No duplicate properties found!');
        setDeletingPropertyId(null);
        return;
      }

      for (const prop of toDelete) {
        const guestsSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'properties', prop.id, 'guests'));
        for (const guestDoc of guestsSnapshot.docs) {
          await deleteDoc(doc(db, 'users', currentUser.uid, 'properties', prop.id, 'guests', guestDoc.id));
        }
        await deleteDoc(doc(db, 'users', currentUser.uid, 'properties', prop.id, 'settings', 'appSettings'));
        await deleteDoc(doc(db, 'users', currentUser.uid, 'properties', prop.id));
      }

      const remainingIds = new Set(properties.map(p => p.id));
      toDelete.forEach(p => remainingIds.delete(p.id));
      const updatedProperties = properties.filter(p => remainingIds.has(p.id));
      setProperties(updatedProperties);

      if (!remainingIds.has(activePropertyId) && updatedProperties.length > 0) {
        await switchProperty(updatedProperties[0].id);
      }

      alert(`Deleted ${toDelete.length} duplicate properties!`);
      setDeletingPropertyId(null);
    } catch (error) {
      console.error('Error deleting duplicates:', error);
      setDeletingPropertyId(null);
      alert('Error deleting duplicates: ' + error.message);
    }
  };

  const compressImage = (file, maxSizeMB = 1) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        compressBase64Image(e.target.result, maxSizeMB).then(resolve).catch(reject);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const compressBase64Image = (base64, maxSizeMB = 1) => {
    return new Promise((resolve, reject) => {
      if (!base64) {
        resolve('');
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDimension = 1920;
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.8;
        let result = canvas.toDataURL('image/jpeg', quality);

        while (result.length > maxSizeMB * 1024 * 1024 && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(result);
      };
      img.onerror = reject;
      img.src = base64;
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 0.15);
        setLogoPreview(compressed);
        setTempSettings(prev => ({ ...prev, logo: compressed }));
      } catch (error) {
        alert('Error processing logo');
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 0.4);
        setImagePreview(compressed);
        setTempSettings(prev => ({ ...prev, housePhoto: compressed }));
      } catch (error) {
        alert('Error processing image');
      }
    }
  };

  const handleRealtorPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 0.15);
        setRealtorPhotoPreview(compressed);
        setTempSettings(prev => ({ ...prev, realtorPhoto: compressed }));
      } catch (error) {
        alert('Error processing realtor photo');
      }
    }
  };

  const enterEditMode = async () => {
    setEditSettings(true);
    try {
      if (settings.logo && settings.logo.length > 150000) {
        const compressed = await compressBase64Image(settings.logo, 0.15);
        setLogoPreview(compressed);
        setTempSettings(prev => ({ ...prev, logo: compressed }));
      }
      if (settings.realtorPhoto && settings.realtorPhoto.length > 150000) {
        const compressed = await compressBase64Image(settings.realtorPhoto, 0.15);
        setRealtorPhotoPreview(compressed);
        setTempSettings(prev => ({ ...prev, realtorPhoto: compressed }));
      }
      if (settings.housePhoto && settings.housePhoto.length > 400000) {
        const compressed = await compressBase64Image(settings.housePhoto, 0.4);
        setImagePreview(compressed);
        setTempSettings(prev => ({ ...prev, housePhoto: compressed }));
      }
    } catch (error) {
      console.error('Error re-compressing images:', error);
    }
  };

  const saveSettings = async () => {
    if (!activePropertyId) {
      alert('No property selected. Please create a property first.');
      return;
    }

    setSaving(true);
    try {
      const settingsToSave = {
        ...tempSettings,
        propertyAddress: tempSettings.propertyAddress || ''
      };

      const docSize = new Blob([JSON.stringify(settingsToSave)]).size;
      if (docSize > 900000) {
        alert('Images are too large. Please re-upload smaller images. The total size must be under 1MB.');
        setSaving(false);
        return;
      }

      await setDoc(doc(db, 'users', currentUser.uid, 'properties', activePropertyId, 'settings', 'appSettings'), settingsToSave);

      const currentProperty = properties.find(p => p.id === activePropertyId);
      if (currentProperty && currentProperty.name !== settingsToSave.propertyAddress && settingsToSave.propertyAddress) {
        await updateDoc(doc(db, 'users', currentUser.uid, 'properties', activePropertyId), {
          name: settingsToSave.propertyAddress
        });
        setProperties(properties.map(p =>
          p.id === activePropertyId ? { ...p, name: settingsToSave.propertyAddress } : p
        ));
      }

      setSettings(settingsToSave);
      setImagePreview(settingsToSave.housePhoto || '');
      setLogoPreview(settingsToSave.logo || '');
      setRealtorPhotoPreview(settingsToSave.realtorPhoto || '');
      setEditSettings(false);
      setSaveConfirmation(true);
      setTimeout(() => setSaveConfirmation(false), 3000);
    } catch (error) {
      console.error('Save error:', error);
      if (error.message && error.message.includes('larger than the maximum')) {
        alert('The settings document is too large. Please use smaller images.');
      } else {
        alert('Error saving settings: ' + (error.message || 'Unknown error'));
      }
    }
    setSaving(false);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return phone.replace(/\D/g, '').length >= 10;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    if (name === 'hasAgencyAgreement' && value === 'Yes') {
      setShowBrokerModal(true);
    } else if (name === 'hasAgencyAgreement' && value === 'No') {
      setBrokerInfo({ brokerName: '', companyName: '' });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone (10+ digits)';
    }
    if (!formData.doNotCall) {
      newErrors.doNotCall = 'Please select an option';
    }
    if (!formData.hasAgencyAgreement) {
      newErrors.hasAgencyAgreement = 'Please select an option';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    const duplicate = guests.find(g => g.email.toLowerCase() === formData.email.toLowerCase());
    if (duplicate) {
      setErrors({ email: 'This email is already registered' });
      setSubmitting(false);
      return;
    }

    try {
      const newGuest = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
        notes: '',
        timestamp: new Date().toISOString(),
        brokerName: formData.hasAgencyAgreement === 'Yes' ? brokerInfo.brokerName : '',
        companyName: formData.hasAgencyAgreement === 'Yes' ? brokerInfo.companyName : ''
      };

      const targetUserId = realtorId || (currentUser ? currentUser.uid : null);
      const targetPropertyId = propertyId || activePropertyId;

      if (!targetUserId || !targetPropertyId) {
        alert('Invalid registration link. Please scan the QR code again.');
        setSubmitting(false);
        return;
      }

      const docRef = await addDoc(collection(db, 'users', targetUserId, 'properties', targetPropertyId, 'guests'), newGuest);
      setGuests([...guests, { id: docRef.id, ...newGuest }]);

      try {
        const now = new Date();
        const emailBody = settings.emailTemplate
          .replace('[DATE]', now.toLocaleDateString())
          .replace('[TIME]', now.toLocaleTimeString())
          .replace('[ADDRESS]', settings.propertyAddress)
          .replace('[REALTOR_NAME]', settings.realtorName);

        const emailDoc = {
          to: [formData.email],
          replyTo: settings.realtorEmail || 'kire.angjushev@veobit.com',
          message: {
            subject: `Thank you for registering - ${settings.propertyAddress}`,
            text: emailBody,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e3a8a;">Thank you for registering!</h2>
              <p style="white-space: pre-line;">${emailBody}</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">This email was sent from your Open House registration.</p>
            </div>`
          }
        };
        console.log('Attempting to create email document:', emailDoc);
        const emailRef = await addDoc(collection(db, 'users', targetUserId, 'mail'), emailDoc);
        console.log('Email queued successfully with ID:', emailRef.id);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        alert('Email error: ' + emailError.message);
      }

      setSubmitted(true);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', doNotCall: '', hasAgencyAgreement: '' });
      setBrokerInfo({ brokerName: '', companyName: '' });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      alert('Error saving registration');
      console.error(error);
    }

    setSubmitting(false);
  };

  const handleAdminLogin = async () => {
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email and password');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setView('admin');
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error('Login error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setLoginError('Invalid email or password');
          break;
        case 'auth/invalid-email':
          setLoginError('Please enter a valid email address');
          break;
        case 'auth/too-many-requests':
          setLoginError('Too many failed attempts. Please try again later.');
          break;
        default:
          setLoginError('Login failed. Please try again.');
      }
    }
  };

  const handleLoginKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdminLogin();
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError('');
    try {
      await signInWithPopup(auth, googleProvider);
      setView('admin');
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (error.code === 'auth/popup-blocked') {
        setLoginError('Popup was blocked. Please allow popups for this site.');
        return;
      }
      setLoginError(`Error: ${error.code || error.message}`);
    }
  };

  const handleForgotPassword = async () => {
    setLoginError('');
    setResetEmailSent(false);

    if (!loginEmail.trim()) {
      setLoginError('Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, loginEmail);
      setResetEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setLoginError('No account found with this email');
          break;
        case 'auth/invalid-email':
          setLoginError('Please enter a valid email address');
          break;
        default:
          setLoginError('Failed to send reset email. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAdminLoggedIn(false);
      setView('public');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out. Please try again.');
    }
  };

  const goToPublicView = () => {
    setView('public');
  };

  const exportGuests = () => {
    try {
      const headers = ['Name', 'First Name', 'Last Name', 'Email', 'Phone', 'Do Not Call', 'Agency Agreement', 'Broker Name', 'Company Name', 'Notes', 'Registration Date'];
      const rows = guests.map(g => [
        g.name || '',
        g.firstName || g.name?.split(' ')[0] || '',
        g.lastName || g.name?.split(' ').slice(1).join(' ') || '',
        g.email || '',
        g.phone || '',
        g.doNotCall || 'N/A',
        g.hasAgencyAgreement || 'N/A',
        g.brokerName || '',
        g.companyName || '',
        (g.notes || '').replace(/"/g, '""'),
        new Date(g.timestamp).toLocaleString()
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `openhouse-guests-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting guest list. Please try again.');
    }
  };

  const handleAddGuest = () => {
    setShowAddGuest(true);
    setGuestFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      doNotCall: '',
      hasAgencyAgreement: '',
      brokerName: '',
      companyName: '',
      notes: ''
    });
  };

  const handleEditGuest = (guest) => {
    setEditingGuest(guest.id);
    setGuestFormData({
      firstName: guest.name.split(' ')[0] || '',
      lastName: guest.name.split(' ').slice(1).join(' ') || '',
      email: guest.email,
      phone: guest.phone,
      doNotCall: guest.doNotCall || '',
      hasAgencyAgreement: guest.hasAgencyAgreement || '',
      brokerName: guest.brokerName || '',
      companyName: guest.companyName || '',
      notes: guest.notes || ''
    });
  };

  const handleDeleteGuest = async (guestId) => {
    if (!activePropertyId) {
      alert('No property selected.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this guest? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'properties', activePropertyId, 'guests', guestId));
        setGuests(guests.filter(g => g.id !== guestId));
        alert('Guest deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting guest: ' + error.message);
      }
    }
  };

  const handleSaveGuest = async () => {
    if (!guestFormData.firstName.trim() || !guestFormData.lastName.trim() || 
        !guestFormData.email.trim() || !guestFormData.phone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!validateEmail(guestFormData.email)) {
      alert('Please enter a valid email');
      return;
    }

    if (!validatePhone(guestFormData.phone)) {
      alert('Please enter a valid phone number');
      return;
    }

    if (!activePropertyId) {
      alert('No property selected. Please create a property first.');
      return;
    }

    try {
      const guestData = {
        name: `${guestFormData.firstName} ${guestFormData.lastName}`,
        firstName: guestFormData.firstName,
        lastName: guestFormData.lastName,
        email: guestFormData.email,
        phone: guestFormData.phone,
        doNotCall: guestFormData.doNotCall,
        hasAgencyAgreement: guestFormData.hasAgencyAgreement,
        brokerName: guestFormData.brokerName,
        companyName: guestFormData.companyName,
        notes: guestFormData.notes
      };

      if (editingGuest) {
        await updateDoc(doc(db, 'users', currentUser.uid, 'properties', activePropertyId, 'guests', editingGuest), guestData);
        setGuests(guests.map(g => g.id === editingGuest ? { ...g, ...guestData } : g));
      } else {
        guestData.timestamp = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'properties', activePropertyId, 'guests'), guestData);
        setGuests([...guests, { id: docRef.id, ...guestData }]);
      }

      setEditingGuest(null);
      setShowAddGuest(false);
      setGuestFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        doNotCall: '',
        hasAgencyAgreement: '',
        brokerName: '',
        companyName: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving guest:', error);
      alert('Error saving guest');
    }
  };

  const handleCancelGuestEdit = () => {
    setEditingGuest(null);
    setShowAddGuest(false);
    setGuestFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      doNotCall: '',
      hasAgencyAgreement: '',
      brokerName: '',
      companyName: '',
      notes: ''
    });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (view === 'public') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {settings.housePhoto ? (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${settings.housePhoto})` }} />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/85 via-slate-900/80 to-blue-900/85" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900" />
        )}

        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
          <button
            onClick={() => adminLoggedIn ? setView('admin') : setView('login')}
            className="text-xs md:text-sm text-white/80 hover:text-white flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg border border-white/20"
          >
            <Lock className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-6 md:py-12 min-h-screen flex items-center justify-center">
          <div className="max-w-2xl w-full">
    {/* Header with Logo and Realtor Photo */}
    <div className="flex justify-between items-start mb-6 md:mb-8">
      {/* Logo - Left */}
      <div>
        {settings.logo ? (
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center p-3">
            <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center">
            <Home className="w-16 h-16 md:w-20 md:h-20 text-blue-950" />
          </div>
        )}
      </div>

      {/* Realtor Photo - Right */}
      {settings.realtorPhoto && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-3 md:border-4 border-white/30 shadow-2xl bg-white">
              <img src={settings.realtorPhoto} alt={settings.realtorName} className="w-full h-full object-cover" />
            </div>
            {settings.realtorName && (
              <p className="text-white text-sm md:text-base font-semibold text-center">
                Hosted by
                <br />
                {settings.realtorName}
              </p>
            )}
          </div>
        </div>
      )}
    </div>

    {/* Welcome Message - Center */}
    <div className="text-center mb-6 md:mb-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 md:mb-3 drop-shadow-lg px-2">
        {settings.welcomeMessage}
      </h1>
      {settings.propertyAddress && (
        <p className="text-lg sm:text-xl md:text-2xl text-white/95 font-semibold drop-shadow-md mb-2 md:mb-3 px-2">
          {settings.propertyAddress}
        </p>
      )}
    </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/20">
              {submitted ? (
                <div className="text-center py-6 md:py-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Mail className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-3">Registration Confirmed!</h2>
                  <div className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base whitespace-pre-line max-w-lg mx-auto">
                    {settings.emailTemplate}
                  </div>
                  <button onClick={() => setSubmitted(false)} className="text-indigo-600 hover:text-indigo-700 font-semibold underline text-sm md:text-base">
                    Register Another Guest
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8 text-center">Register for Open House</h2>
                  <div className="space-y-4 md:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">First Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-3 md:py-3.5 text-sm md:text-base border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-blue-950 focus:border-transparent`}
                            placeholder="John"
                          />
                        </div>
                        {errors.firstName && <p className="mt-1 md:mt-1.5 text-xs md:text-sm text-red-600">{errors.firstName}</p>}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Last Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-3 md:py-3.5 text-sm md:text-base border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-blue-950 focus:border-transparent`}
                            placeholder="Doe"
                          />
                        </div>
                        {errors.lastName && <p className="mt-1 md:mt-1.5 text-xs md:text-sm text-red-600">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onKeyPress={handleKeyPress}
                          className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-3 md:py-3.5 text-sm md:text-base border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-blue-950 focus:border-transparent`}
                          placeholder="john@example.com"
                        />
                      </div>
                      {errors.email && <p className="mt-1 md:mt-1.5 text-xs md:text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          onKeyPress={handleKeyPress}
                          className={`w-full pl-9 md:pl-10 pr-3 md:pr-4 py-3 md:py-3.5 text-sm md:text-base border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-blue-950 focus:border-transparent`}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      {errors.phone && <p className="mt-1 md:mt-1.5 text-xs md:text-sm text-red-600">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        Is this # on the DO NOT CALL registry? *
                      </label>
                      <div className="flex gap-3 md:gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="doNotCall"
                            value="Yes"
                            checked={formData.doNotCall === 'Yes'}
                            onChange={handleInputChange}
                            className="w-4 h-4 md:w-5 md:h-5 text-blue-950 focus:ring-blue-950"
                          />
                          <span className="ml-2 text-sm md:text-base text-gray-700">Yes</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="doNotCall"
                            value="No"
                            checked={formData.doNotCall === 'No'}
                            onChange={handleInputChange}
                            className="w-4 h-4 md:w-5 md:h-5 text-blue-950 focus:ring-blue-950"
                          />
                          <span className="ml-2 text-sm md:text-base text-gray-700">No</span>
                        </label>
                      </div>
                      {errors.doNotCall && <p className="mt-1 md:mt-1.5 text-xs md:text-sm text-red-600">{errors.doNotCall}</p>}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        Have you signed a BUYER REPRESENTATION or AGENCY AGREEMENT with another broker? *
                      </label>
                      <div className="flex gap-3 md:gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="hasAgencyAgreement"
                            value="Yes"
                            checked={formData.hasAgencyAgreement === 'Yes'}
                            onChange={handleInputChange}
                            className="w-4 h-4 md:w-5 md:h-5 text-blue-950 focus:ring-blue-950"
                          />
                          <span className="ml-2 text-sm md:text-base text-gray-700">Yes</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="hasAgencyAgreement"
                            value="No"
                            checked={formData.hasAgencyAgreement === 'No'}
                            onChange={handleInputChange}
                            className="w-4 h-4 md:w-5 md:h-5 text-blue-950 focus:ring-blue-950"
                          />
                          <span className="ml-2 text-sm md:text-base text-gray-700">No</span>
                        </label>
                      </div>
                      {errors.hasAgencyAgreement && <p className="mt-1 md:mt-1.5 text-xs md:text-sm text-red-600">{errors.hasAgencyAgreement}</p>}
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-blue-950 to-blue-800 hover:from-blue-900 hover:to-blue-700 text-white font-bold py-5 md:py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg md:text-xl mt-4 md:mt-6 flex items-center justify-center gap-2.5 disabled:opacity-50"
                    >
                      {submitting ? 'Registering...' : (
                        <>
                          <UserPlus className="w-6 h-6 md:w-7 md:h-7" />
                          Register Now
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
              
              {showBrokerModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Buyer Representation Details</h3>
                    <p className="text-gray-600 mb-6 text-sm md:text-base">Please provide your broker information</p>
                    
                    <div className="space-y-4 md:space-y-5">
                      <div>
                        <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">Broker/Agent Name *</label>
                        <input
                          type="text"
                          value={brokerInfo.brokerName}
                          onChange={(e) => setBrokerInfo({...brokerInfo, brokerName: e.target.value})}
                          className="w-full px-4 py-3 md:py-4 text-base md:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                          placeholder="John Smith"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm md:text-base font-semibold text-gray-700 mb-2">Company Name *</label>
                        <input
                          type="text"
                          value={brokerInfo.companyName}
                          onChange={(e) => setBrokerInfo({...brokerInfo, companyName: e.target.value})}
                          className="w-full px-4 py-3 md:py-4 text-base md:text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                          placeholder="ABC Realty"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => {
                            if (brokerInfo.brokerName.trim() && brokerInfo.companyName.trim()) {
                              setShowBrokerModal(false);
                            } else {
                              alert('Please fill in both broker name and company name');
                            }
                          }}
                          className="flex-1 bg-gradient-to-r from-blue-950 to-blue-800 hover:from-blue-900 hover:to-blue-700 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg text-base md:text-lg"
                        >
                          Continue
                        </button>
                        <button
                          onClick={() => {
                            setShowBrokerModal(false);
                            setFormData({...formData, hasAgencyAgreement: ''});
                            setBrokerInfo({ brokerName: '', companyName: '' });
                          }}
                          className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 md:py-4 rounded-xl text-base md:text-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {settings.realtorEmail && (
              <div className="text-center mt-4 sm:mt-6">
                <p className="text-white/80 text-xs sm:text-sm px-4">
                  Questions? Contact us at <a href={`mailto:${settings.realtorEmail}`} className="text-white font-semibold hover:underline break-all">{settings.realtorEmail}</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full">
          <div className="text-center mb-5 sm:mb-6">
            <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {showForgotPassword ? 'Reset Password' : 'Admin Login'}
            </h2>
            {showForgotPassword && (
              <p className="text-sm text-gray-500 mt-2">Enter your email to receive a reset link</p>
            )}
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {loginError}
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setLoginError(''); }}
                  onKeyPress={handleLoginKeyPress}
                  className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                  placeholder="admin@example.com"
                />
              </div>
            </div>
            {!showForgotPassword && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                    onKeyPress={handleLoginKeyPress}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10 text-sm sm:text-base"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(true); setLoginError(''); setResetEmailSent(false); }}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {showForgotPassword && resetEmailSent && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                Password reset email sent! Check your inbox.
              </div>
            )}

            {showForgotPassword ? (
              <button onClick={handleForgotPassword} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg text-sm sm:text-base">
                Send Reset Email
              </button>
            ) : (
              <button onClick={handleAdminLogin} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg text-sm sm:text-base">
                Login
              </button>
            )}

            {showForgotPassword && (
              <button
                onClick={() => { setShowForgotPassword(false); setLoginError(''); setResetEmailSent(false); }}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                Back to login
              </button>
            )}

            {!showForgotPassword && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-lg text-sm sm:text-base"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
              </>
            )}

            <button onClick={goToPublicView} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-lg text-sm sm:text-base mt-2">
              Back to Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                <button onClick={() => setShowQRModal(true)} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 flex-1 sm:flex-none justify-center">
                  <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  QR Code
                </button>
                <button onClick={goToPublicView} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 flex-1 sm:flex-none justify-center">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  View Page
                </button>
                <button onClick={handleLogout} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 sm:flex-none justify-center">
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Logout
                </button>
              </div>
            </div>

            {/* Property Selector */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Property:</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {properties.length > 0 ? (
                  <select
                    value={activePropertyId || ''}
                    onChange={(e) => switchProperty(e.target.value)}
                    className="flex-1 sm:flex-none border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-0 sm:min-w-[200px]"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name || 'Untitled Property'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-gray-500 italic">No properties yet</span>
                )}
                <button
                  onClick={() => setShowPropertyModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </button>
                {properties.length > 0 && (
                  <button
                    onClick={() => setShowManagePropertiesModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    title="Manage properties"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Manage</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-5 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Settings</h2>
                {!editSettings ? (
                  <button onClick={enterEditMode} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm sm:text-base w-full sm:w-auto justify-center">
                    <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={saveSettings} disabled={saving} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base flex-1 sm:flex-none justify-center">
                      <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => { setEditSettings(false); setTempSettings(settings); }} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm sm:text-base">
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                )}
              </div>

              {saveConfirmation && (
                <div className="mb-3 sm:mb-4 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                  <Save className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                  <p className="font-semibold text-green-800 text-sm sm:text-base">Settings saved successfully!</p>
                </div>
              )}

              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Welcome Message</label>
                  <input
                    type="text"
                    value={editSettings ? tempSettings.welcomeMessage : settings.welcomeMessage}
                    onChange={(e) => setTempSettings({ ...tempSettings, welcomeMessage: e.target.value })}
                    disabled={!editSettings}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg disabled:bg-gray-50 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Property Address</label>
                  <input
                    type="text"
                    value={editSettings ? tempSettings.propertyAddress : settings.propertyAddress}
                    onChange={(e) => setTempSettings({ ...tempSettings, propertyAddress: e.target.value })}
                    disabled={!editSettings}
                    placeholder="123 Main Street, City, State 12345"
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg disabled:bg-gray-50 text-sm sm:text-base"
                  />
                  <p className="mt-1 text-xs text-gray-500">Displayed below welcome message on registration page</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Logo</label>
                  {(editSettings ? logoPreview : settings.logo) ? (
                    <div className="mb-2 bg-white border-2 rounded-lg p-4 sm:p-6 flex justify-center">
                      <img src={editSettings ? logoPreview : settings.logo} alt="Logo" className="h-20 w-20 sm:h-24 sm:w-24 object-contain" />
                    </div>
                  ) : (
                    <div className="mb-2 bg-gray-50 border-2 border-dashed rounded-lg p-4 sm:p-6 text-center">
                      <Home className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-gray-500">No logo</p>
                    </div>
                  )}
                  {editSettings && (
                    <label className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 text-sm sm:text-base">
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Realtor Photo</label>
                  {(editSettings ? realtorPhotoPreview : settings.realtorPhoto) ? (
                    <div className="mb-2 bg-white border-2 rounded-lg p-4 sm:p-6 flex justify-center">
                      <img src={editSettings ? realtorPhotoPreview : settings.realtorPhoto} alt="Realtor" className="h-28 w-28 sm:h-32 sm:w-32 object-cover rounded-full" />
                    </div>
                  ) : (
                    <div className="mb-2 bg-gray-50 border-2 border-dashed rounded-lg p-4 sm:p-6 text-center">
                      <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-gray-500">No realtor photo</p>
                    </div>
                  )}
                  {editSettings && (
                    <label className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 text-sm sm:text-base">
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                      {realtorPhotoPreview ? 'Change Photo' : 'Upload Photo'}
                      <input type="file" accept="image/*" onChange={handleRealtorPhotoUpload} className="hidden" />
                    </label>
                  )}
                  <p className="mt-2 text-xs text-gray-500">Headshot (displays as circle)</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">House Photo</label>
                  {(editSettings ? imagePreview : settings.housePhoto) ? (
                    <img src={editSettings ? imagePreview : settings.housePhoto} alt="House" className="w-full h-48 sm:h-56 object-cover rounded-lg mb-2" />
                  ) : (
                    <div className="mb-2 bg-gray-50 border-2 border-dashed rounded-lg h-48 sm:h-56 flex flex-col items-center justify-center">
                      <Home className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-2" />
                      <p className="text-xs sm:text-sm text-gray-500">No house photo</p>
                    </div>
                  )}
                  {editSettings && (
                    <label className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 text-sm sm:text-base">
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                      {imagePreview ? 'Change Photo' : 'Upload Photo'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Realtor Name</label>
                  <input
                    type="text"
                    value={editSettings ? tempSettings.realtorName : settings.realtorName}
                    onChange={(e) => setTempSettings({ ...tempSettings, realtorName: e.target.value })}
                    disabled={!editSettings}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg disabled:bg-gray-50 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Realtor Email</label>
                  <input
                    type="email"
                    value={editSettings ? tempSettings.realtorEmail : settings.realtorEmail}
                    onChange={(e) => setTempSettings({ ...tempSettings, realtorEmail: e.target.value })}
                    disabled={!editSettings}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg disabled:bg-gray-50 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email Template</label>
                  <textarea
                    value={editSettings ? tempSettings.emailTemplate : settings.emailTemplate}
                    onChange={(e) => setTempSettings({ ...tempSettings, emailTemplate: e.target.value })}
                    disabled={!editSettings}
                    rows="8"
                    placeholder="Thank you for registering for our open house!"
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg disabled:bg-gray-50 text-sm sm:text-base font-mono"
                  />
                  <p className="mt-1 text-xs text-gray-500">Use [DATE], [TIME], [ADDRESS], [REALTOR_NAME] as placeholders</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-5 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Guest List ({guests.length})</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={handleAddGuest} 
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none justify-center"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Add Guest</span>
                    <span className="xs:hidden">Add</span>
                  </button>
                  {guests.length > 0 && (
                    <button 
                      onClick={exportGuests} 
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none justify-center"
                    >
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Export CSV</span>
                      <span className="xs:hidden">Export</span>
                    </button>
                  )}
                </div>
              </div>

              {(showAddGuest || editingGuest) && (
                <div className="mb-4 sm:mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 sm:p-5 md:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
                    {editingGuest ? 'Edit Guest' : 'Add New Guest'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        value={guestFormData.firstName}
                        onChange={(e) => setGuestFormData({...guestFormData, firstName: e.target.value})}
                        className="w-full px-2.5 sm:px-3 py-2 border rounded-lg text-sm sm:text-base"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={guestFormData.lastName}
                        onChange={(e) => setGuestFormData({...guestFormData, lastName: e.target.value})}
                        className="w-full px-2.5 sm:px-3 py-2 border rounded-lg text-sm sm:text-base"
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={guestFormData.email}
                        onChange={(e) => setGuestFormData({...guestFormData, email: e.target.value})}
                        className="w-full px-2.5 sm:px-3 py-2 border rounded-lg text-sm sm:text-base"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={guestFormData.phone}
                        onChange={(e) => setGuestFormData({...guestFormData, phone: e.target.value})}
                        className="w-full px-2.5 sm:px-3 py-2 border rounded-lg text-sm sm:text-base"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Do Not Call</label>
                      <select
                        value={guestFormData.doNotCall}
                        onChange={(e) => setGuestFormData({...guestFormData, doNotCall: e.target.value})}
                        className="w-full px-2.5 sm:px-3 py-2 border rounded-lg text-sm sm:text-base"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Agency Agreement</label>
                      <select
                        value={guestFormData.hasAgencyAgreement}
                        onChange={(e) => setGuestFormData({...guestFormData, hasAgencyAgreement: e.target.value})}
                        className="w-full px-2.5 sm:px-3 py-2 border rounded-lg text-sm sm:text-base"
                      >
                        <option value="">Select...</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                  
                  {guestFormData.hasAgencyAgreement === 'Yes' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-100 border border-blue-300 rounded-lg">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Broker/Agent Name</label>
                        <input
                          type="text"
                          value={guestFormData.brokerName}
                          onChange={(e) => setGuestFormData({...guestFormData, brokerName: e.target.value})}
                          className="w-full px-2.5 sm:px-3 py-2 border rounded-lg text-sm sm:text-base"
                          placeholder="John Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input
                          type="text"
                          value={guestFormData.companyName}
                          onChange={(e) => setGuestFormData({...guestFormData, companyName: e.target.value})}
                          className="w-full px-2.5 sm:px-3 py-2 border rounded-lg text-sm sm:text-base"
                          placeholder="ABC Realty"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3 sm:mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={guestFormData.notes}
                      onChange={(e) => setGuestFormData({...guestFormData, notes: e.target.value})}
                      className="w-full px-2.5 sm:px-3 py-2 border rounded-lg text-sm sm:text-base"
                      rows="3"
                      placeholder="Add any notes about this guest..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveGuest} className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm sm:text-base flex-1 sm:flex-none">
                      {editingGuest ? 'Update Guest' : 'Add Guest'}
                    </button>
                    <button onClick={handleCancelGuestEdit} className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium text-sm sm:text-base">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {guests.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">No registrations yet</div>
              ) : (
                <div className="space-y-2.5 sm:space-y-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
                  {guests.map((guest) => (
                    <div key={guest.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start gap-2 sm:gap-0">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-base sm:text-lg truncate">{guest.name}</h3>
                          <div className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-2 break-all">
                              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="break-all">{guest.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                              {guest.phone}
                            </div>
                            {guest.doNotCall && (
                              <div className="text-xs mt-2">
                                <span className="font-medium">Do Not Call:</span> {guest.doNotCall}
                              </div>
                            )}
                            {guest.hasAgencyAgreement && (
                              <div className="text-xs">
                                <span className="font-medium">Agency Agreement:</span> {guest.hasAgencyAgreement}
                              </div>
                            )}
                            {guest.hasAgencyAgreement === 'Yes' && (guest.brokerName || guest.companyName) && (
                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                {guest.brokerName && (
                                  <div><span className="font-medium">Broker:</span> {guest.brokerName}</div>
                                )}
                                {guest.companyName && (
                                  <div><span className="font-medium">Company:</span> {guest.companyName}</div>
                                )}
                              </div>
                            )}
                            {guest.notes && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                <span className="font-medium">Notes:</span> {guest.notes}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(guest.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
                          <button
                            onClick={() => handleEditGuest(guest)}
                            className="p-2 sm:p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit guest"
                          >
                            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="p-2 sm:p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete guest"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">Registration QR Code</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!activePropertyId ? (
                <div className="text-center py-8">
                  <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No property selected</p>
                  <button
                    onClick={() => { setShowQRModal(false); setShowPropertyModal(true); }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Create Your First Property
                  </button>
                </div>
              ) : (
              <div className="text-center">
                <div className="bg-white p-6 rounded-xl border-2 border-gray-100 inline-block mb-4">
                  {/* Visible SVG for display */}
                  <QRCodeSVG
                    value={getRegistrationUrl()}
                    size={200}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#1e3a8a"
                  />
                  {/* Hidden Canvas for download */}
                  <QRCodeCanvas
                    id="qr-code-canvas"
                    value={getRegistrationUrl()}
                    size={400}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#1e3a8a"
                    style={{ display: 'none' }}
                  />
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  Scan to register for the open house
                </p>
                <p className="text-xs text-gray-500 mb-6 break-all px-4">
                  {getRegistrationUrl()}
                </p>

                {settings.propertyAddress && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-sm font-semibold text-blue-800">
                      {settings.propertyAddress}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={downloadQRCode}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getRegistrationUrl());
                      alert('Link copied to clipboard!');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
              )}
            </div>
          </div>
        )}

        {/* Add Property Modal */}
        {showPropertyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">Add New Property</h3>
                <button
                  onClick={() => { setShowPropertyModal(false); setNewPropertyName(''); }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Address / Name</label>
                  <input
                    type="text"
                    value={newPropertyName}
                    onChange={(e) => setNewPropertyName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newPropertyName.trim()) {
                        createProperty(newPropertyName);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="123 Main Street, City, State"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => createProperty(newPropertyName)}
                    disabled={!newPropertyName.trim() || creatingProperty}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    {creatingProperty ? 'Creating...' : 'Create Property'}
                  </button>
                  <button
                    onClick={() => { setShowPropertyModal(false); setNewPropertyName(''); }}
                    disabled={creatingProperty}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manage Properties Modal */}
        {showManagePropertiesModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">Manage Properties</h3>
                <button
                  onClick={() => setShowManagePropertiesModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                {properties.length} {properties.length === 1 ? 'property' : 'properties'} total
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {properties.map((property, index) => (
                  <div
                    key={property.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      activePropertyId === property.id
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs text-gray-400 w-6">{index + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {property.name || 'Untitled Property'}
                        </p>
                        {activePropertyId === property.id && (
                          <span className="text-xs text-indigo-600">Currently selected</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activePropertyId !== property.id && (
                        <button
                          onClick={() => {
                            switchProperty(property.id);
                            setShowManagePropertiesModal(false);
                          }}
                          className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-100 rounded-lg"
                        >
                          Select
                        </button>
                      )}
                      <button
                        onClick={() => deleteProperty(property.id, false)}
                        disabled={properties.length <= 1 || deletingPropertyId === property.id}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        title={properties.length <= 1 ? 'Cannot delete last property' : 'Delete property'}
                      >
                        {deletingPropertyId === property.id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t">
                <button
                  onClick={deleteDuplicateProperties}
                  disabled={deletingPropertyId === 'bulk' || properties.length <= 1}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingPropertyId === 'bulk' ? 'Deleting Duplicates...' : 'Delete All Duplicates'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowManagePropertiesModal(false);
                      setShowPropertyModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Add New
                  </button>
                  <button
                    onClick={() => setShowManagePropertiesModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}