import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { get, patch } from '../../api/axios';
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
    businessName: '',
    businessNameColor: '#333333',
    address: '',
    mobileNum: '',
    businessNum: '',
    email: '',
    web: '',
    logo: '',
    taxId: '',
    validity: 30,
    terms: '',
    prefix: 'QUO',
    invoicePrefix: 'INV', currency: 'USD'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const getImageUrl = (logoPath) => {
    if (!logoPath) return '';
    if (logoPath.startsWith('data:image/')) return logoPath;
    if (logoPath.startsWith('http')) return logoPath;
    return `http://localhost:5000${logoPath}`;
  };

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      try {
        const res = await get('/configuration');
        if (res.success) {
          const c = res.data;
          setConfig(c);
          setForm({
            bankName: c.bank?.name || '',
            accountName: c.bank?.accountName || '',
            accountNumber: c.bank?.accountNumber || '',
            businessName: c.business?.name || '',
            businessNameColor: c.business?.nameColor || '#333333', address: c.business?.address || '',
            mobileNum: c.business?.mobileNum || '',
            businessNum: c.business?.businessNum || '',
            email: c.business?.email || '',
            web: c.business?.web || '',
            taxId: c.business?.taxId || '',
            validity: c.quotation?.validity || 30,
            terms: c.quotation?.terms || '',
            prefix: c.quotation?.prefix || 'QUO',
            invoicePrefix: c.quotation?.invoicePrefix || 'INV',
            currency: c.business?.currency || c.quotation?.currency
          });
          setLogoPreview(c.business?.logo || '');
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
      if (file.size > 5 * 1024 * 1024) {
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
      if (logoFile) {
        try {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(logoFile);
          });

          const uploadData = await patch('/configuration/upload-logo', { logoBase64: base64 });

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
        },
        business: {
          name: form.businessName,
          nameColor: form.businessNameColor,
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
          prefix: form.prefix,
          invoicePrefix: form.invoicePrefix, currency: form.currency
        }
      };

      const res = await patch('/configuration', payload);
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
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">

        {/* Business Info Section */}
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Label>
            <span>Business Name</span>
            <Input name="businessName" value={form.businessName} onChange={handleChange} />
          </Label>
          <Label>
            <span>Business Name Color</span>
            <input
              type="color"
              name="businessNameColor"
              value={form.businessNameColor}
              onChange={handleChange}
              className="mt-1 block w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <HelperText>Choose color for business name in documents</HelperText>
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
          <Label>
            <span>Invoice Prefix</span>
            <Input name="invoicePrefix" value={form.invoicePrefix} onChange={handleChange} />
            <HelperText>Prefix for invoice numbers (e.g., INV-202409-0001)</HelperText>
          </Label>
          <Label className="md:col-span-2">
            <span>Terms & Conditions</span>
            <textarea
              name="terms"
              value={form.terms}
              onChange={handleChange}
              className="mt-1 block w-full pt-2 pl-2 border-2 border-gray-300 rounded-md shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows="4"
              placeholder="Enter default terms and conditions for quotations..."
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