import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { get, put, uploadFile } from '../../api/axios';
import {
  Button, Label, Input, HelperText, Select
} from '@windmill/react-ui';
import PageTitle from '../../components/Typography/PageTitle';

function Configuration() {
  const history = useHistory();
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    businessName: '',
    address: '',
    mobileNum: '',
    businessNum: '',
    email: '',
    web: '',
    logo: '',
    taxId: '',
    validity: 30,
    terms: '',
    notes: '',
    prefix: 'QUO',
    currency: 'USD'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const getImageUrl = (logoPath) => {
    if (!logoPath) return '';
    if (logoPath.startsWith('http')) return logoPath; // Already full URL
    return `http://localhost:5000${logoPath}`; // Add backend URL
  };
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' }
  ];

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      try {
        const res = await get('/configuration');
        if (res.success) {
          const c = res.data.configuration;
          setConfig(c);
          setForm({
            bankName: c.bank?.name || '',
            accountName: c.bank?.accountName || '',
            accountNumber: c.bank?.accountNumber || '',
            routingNumber: c.bank?.routingNumber || '',
            businessName: c.business?.name || '',
            address: c.business?.address || '',
            mobileNum: c.business?.mobileNum || '',
            businessNum: c.business?.businessNum || '',
            email: c.business?.email || '',
            web: c.business?.web || '',
            taxId: c.business?.taxId || '',
            validity: c.quotation?.validity || 30,
            terms: c.quotation?.terms || '',
            notes: c.quotation?.notes || '',
            prefix: c.quotation?.prefix || 'QUO',
            currency: c.quotation?.currency || c.business?.currency
          });
          setLogoPreview(c.business?.logo ? `http://localhost:5000${c.business.logo}` : '');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load configuration');
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleLogoUpload = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Logo file size should be less than 5MB');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
      if (error) setError('');
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    document.getElementById('logo-upload').value = '';
  };
  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      let logoUrl = logoPreview;

      // If there's a new logo file, upload it first
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);

        try {
          const uploadData = await uploadFile('/configuration/upload-logo', formData);

          if (uploadData.success) {
            logoUrl = uploadData.logoUrl;
          } else {
            throw new Error(uploadData.message || 'Logo upload failed');
          }
        } catch (uploadErr) {
          setError('Failed to upload logo: ' + uploadErr.message);
          setSaving(false);
          return;
        }
      } const payload = {
        bank: {
          name: form.bankName,
          accountName: form.accountName,
          accountNumber: form.accountNumber,
          routingNumber: form.routingNumber
        },
        business: {
          name: form.businessName,
          address: form.address,
          mobileNum: form.mobileNum,
          businessNum: form.businessNum,
          email: form.email,
          web: form.web,
          logo: logoUrl,
          taxId: form.taxId,
          currency: form.currency
        },
        quotation: {
          validity: Number(form.validity),
          terms: form.terms,
          notes: form.notes,
          prefix: form.prefix,
          currency: form.currency
        }
      };

      const res = await put('/configuration', payload);
      if (res.success) {
        setConfig(res.data.configuration);
        alert('Configuration saved successfully');
        window.dispatchEvent(new CustomEvent('currencyUpdated', { detail: { currency: form.currency } }));

      } else {
        setError(res.message || 'Save failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Save failed');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageTitle>Loading...</PageTitle>;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Configuration</PageTitle>
        <Button onClick={() => history.push('/app/quotations')}>
          Quotations
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        {/* Bank Info Section */}
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Bank Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Label>
            <span>Bank Name</span>
            <Input name="bankName" value={form.bankName} onChange={handleChange} />
          </Label>
          <Label>
            <span>Account Name</span>
            <Input name="accountName" value={form.accountName} onChange={handleChange} />
          </Label>
          <Label>
            <span>Account Number</span>
            <Input name="accountNumber" value={form.accountNumber} onChange={handleChange} />
          </Label>
          <Label>
            <span>Routing Number</span>
            <Input name="routingNumber" value={form.routingNumber} onChange={handleChange} />
          </Label>
        </div>

        {/* Business Info Section */}
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Label>
            <span>Business Name</span>
            <Input name="businessName" value={form.businessName} onChange={handleChange} />
          </Label>
          <Label>
            <span>Business Address</span>
            <Input name="address" value={form.address} onChange={handleChange} />
          </Label>
          <Label>
            <span>Mobile Number</span>
            <Input name="mobileNum" value={form.mobileNum} onChange={handleChange} />
          </Label>
          <Label>
            <span>Business Number</span>
            <Input name="businessNum" value={form.businessNum} onChange={handleChange} />
          </Label>
          <Label>
            <span>Email</span>
            <Input name="email" value={form.email} onChange={handleChange} type="email" />
          </Label>
          <Label>
            <span>Website URL</span>
            <Input name="web" value={form.web} onChange={handleChange} />
          </Label>
          <Label>
            <span>Business Logo</span>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-gray-700 dark:file:text-gray-300"
            />
            <HelperText>Upload an image file (max 5MB)</HelperText>
          </Label>
          <Label>
            <span>Tax ID</span>
            <Input name="taxId" value={form.taxId} onChange={handleChange} />
          </Label>
          <Label>
            <span>Default Currency *</span>
            <Select
              className="mt-1"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              required
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="AED">AED - UAE Dirham</option>
              <option value="PKR">PKR - Pakistani Rupee</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="SAR">SAR - Saudi Riyal</option>
            </Select>
            <HelperText>Currency for all quotations and pricing</HelperText>
          </Label>
          {logoPreview && (
            <div className="md:col-span-2">
              <div className="flex items-center gap-4">
                <img
                  src={getImageUrl(logoPreview)}
                  alt="Logo Preview"
                  className="h-20 mt-2 object-contain rounded border"
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                />
                <Button
                  type="button"
                  onClick={removeLogo}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
                >
                  Remove Logo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Quotation Settings Section */}
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Quotation Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Label>
            <span>Quotation Validity (Days)</span>
            <Input
              name="validity"
              value={form.validity}
              onChange={handleChange}
              type="number"
              min="1"
              max="365"
            />
            <HelperText>How many days quotations remain valid</HelperText>
          </Label>
          <Label>
            <span>Quotation Prefix</span>
            <Input name="prefix" value={form.prefix} onChange={handleChange} />
            <HelperText>Prefix for quotation numbers (e.g., QUO-202409-0001)</HelperText>
          </Label>
          <Label className="md:col-span-2">
            <span>Terms & Conditions</span>
            <textarea
              name="terms"
              value={form.terms}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows="4"
              placeholder="Enter default terms and conditions for quotations..."
            />
          </Label>
          <Label className="md:col-span-2">
            <span>Default Notes</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows="3"
              placeholder="Enter default notes for quotations..."
            />
          </Label>
        </div>

        {error && (
          <HelperText valid={false} className="mt-4">{error}</HelperText>
        )}

        <div className="mt-6">
          <Button
            onClick={handleSubmit}
            style={{ backgroundColor: "#AA1A21" }}
            className="text-white"
            disabled={saving}
          >
            {saving ? 'Saving...' : (config ? 'Update Configuration' : 'Save Configuration')}
          </Button>
        </div>
      </div>
    </>
  );
}

export default Configuration;