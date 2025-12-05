import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Check, Loader2, FileText, User, MapPin, Award, ArrowLeft, Eye, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

// --- REUSABLE DOCTOR FORM SECTION ---
const DoctorSection = ({ 
  index, 
  title, 
  icon: Icon, 
  colorClass, 
  required, 
  formData, 
  handleChange, 
  handleFileChange, 
  photoPreviewUrl 
}) => {
  const prefix = index === 1 ? 'doc1_' : 'doc2_';
  
  return (
    <div className={`border rounded-xl overflow-hidden mb-8 shadow-sm ${index === 2 ? 'border-purple-100' : 'border-blue-100'}`}>
      <div className={`p-4 ${index === 2 ? 'bg-purple-50' : 'bg-blue-50'} border-b flex items-center justify-between`}>
        <h3 className={`font-bold text-lg flex items-center ${colorClass}`}>
          <Icon className="w-5 h-5 mr-2" /> {title}
        </h3>
        {index === 1 && <span className="text-xs bg-white px-2 py-1 rounded text-gray-500 font-medium">Primary Applicant</span>}
      </div>
      
      <div className="p-6 space-y-6 bg-white">
        {/* Personal Info Row */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name {required && '*'}</label>
            <input
              type="text"
              name={`${prefix}fullName`}
              required={required}
              value={formData[`${prefix}fullName`] || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder={`Dr. ${index === 1 ? 'Name' : 'Spouse Name'}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father's / Husband's Name</label>
            <input
              type="text"
              name={`${prefix}fatherHusbandName`}
              value={formData[`${prefix}fatherHusbandName`] || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name={`${prefix}gender`}
              value={formData[`${prefix}gender`]}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name={`${prefix}dob`}
              value={formData[`${prefix}dob`] || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <select
              name={`${prefix}bloodGroup`}
              value={formData[`${prefix}bloodGroup`]}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Oh+'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Professional Info */}
        <div className="border-t pt-6">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Professional Details</h4>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Degree / Diploma</label>
              <input
                type="text"
                name={`${prefix}qualificationDegree`}
                value={formData[`${prefix}qualificationDegree`] || ''}
                onChange={handleChange}
                placeholder="MBBS, MD..."
                className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">University</label>
              <input
                type="text"
                name={`${prefix}qualificationUniversity`}
                value={formData[`${prefix}qualificationUniversity`] || ''}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Year of Passing</label>
              <input
                type="number"
                name={`${prefix}qualificationYear`}
                value={formData[`${prefix}qualificationYear`] || ''}
                onChange={handleChange}
                placeholder="YYYY"
                className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Registration No.</label>
              <input
                type="text"
                name={`${prefix}registrationNumber`}
                value={formData[`${prefix}registrationNumber`] || ''}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Council Name</label>
              <input
                type="text"
                name={`${prefix}medicalCouncil`}
                value={formData[`${prefix}medicalCouncil`] || ''}
                onChange={handleChange}
                placeholder="TNMC"
                className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Speciality</label>
              <input
                type="text"
                name={`${prefix}speciality`}
                value={formData[`${prefix}speciality`] || ''}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Designation</label>
               <select
                name={`${prefix}designation`}
                value={formData[`${prefix}designation`] || ''}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select...</option>
                <option value="Private Practice">Private Practice</option>
                <option value="Government Service">Government Service</option>
                <option value="Corporate Hospital">Corporate Hospital</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="border-t pt-6">
           <label className="block text-sm font-medium text-gray-700 mb-2">Passport Photo</label>
           <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 border">
                 {photoPreviewUrl ? (
                   <img src={photoPreviewUrl} className="h-full w-full object-cover" alt="Preview" />
                 ) : (
                   <User className="h-8 w-8 m-auto mt-4 text-gray-300" />
                 )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index)}
                  id={`photo-upload-${index}`}
                  className="hidden"
                />
                <label 
                  htmlFor={`photo-upload-${index}`} 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" /> Choose File
                </label>
                <p className="text-xs text-gray-500 mt-1">Max 5MB. JPG/PNG.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const MembershipApplicationForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Separate photo states for two doctors
  const [photoFile1, setPhotoFile1] = useState(null);
  const [photoPreviewUrl1, setPhotoPreviewUrl1] = useState(null);
  const [photoFile2, setPhotoFile2] = useState(null);
  const [photoPreviewUrl2, setPhotoPreviewUrl2] = useState(null);

  // Initialize form data
  const [formData, setFormData] = useState({
    membershipType: 'Life Single', // Default set to Life Single
    
    // Doctor 1 Details
    doc1_fullName: '',
    doc1_fatherHusbandName: '',
    doc1_dob: '',
    doc1_gender: 'Male',
    doc1_bloodGroup: 'O+',
    doc1_qualificationDegree: '',
    doc1_qualificationUniversity: '',
    doc1_qualificationYear: '',
    doc1_registrationNumber: '',
    doc1_registrationDate: '',
    doc1_medicalCouncil: '',
    doc1_speciality: '',
    doc1_designation: '', 

    // Doctor 2 Details (Spouse)
    doc2_fullName: '',
    doc2_fatherHusbandName: '',
    doc2_dob: '',
    doc2_gender: 'Female',
    doc2_bloodGroup: 'O+',
    doc2_qualificationDegree: '',
    doc2_qualificationUniversity: '',
    doc2_qualificationYear: '',
    doc2_registrationNumber: '',
    doc2_registrationDate: '',
    doc2_medicalCouncil: '',
    doc2_speciality: '',
    doc2_designation: '',

    // Common Contact Info
    address: '',
    city: '',
    pincode: '',
    phone: '',
    mobile: '',
    email: '',
    panNumber: '',
    
    // Agreements
    declarationAccepted: false
  });

  const isCouple = formData.membershipType === 'Life Couple';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, doctorIndex) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (doctorIndex === 1) {
        setPhotoFile1(file);
        setPhotoPreviewUrl1(URL.createObjectURL(file));
      } else {
        setPhotoFile2(file);
        setPhotoPreviewUrl2(URL.createObjectURL(file));
      }
    }
  };

  useEffect(() => {
    return () => {
      if (photoPreviewUrl1) URL.revokeObjectURL(photoPreviewUrl1);
      if (photoPreviewUrl2) URL.revokeObjectURL(photoPreviewUrl2);
    };
  }, [photoPreviewUrl1, photoPreviewUrl2]);

  const uploadPhoto = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('member-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('member-photos').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (!formData.declarationAccepted) {
      toast({
        title: "Declaration Required",
        description: "Please accept the declaration to proceed.",
        variant: "destructive"
      });
      return;
    }
    setShowPreview(true);
    window.scrollTo(0, 0);
  };

  const handleEdit = () => {
    setShowPreview(false);
    window.scrollTo(0, 0);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Upload photos
      const [photoUrl1, photoUrl2] = await Promise.all([
        uploadPhoto(photoFile1),
        isCouple ? uploadPhoto(photoFile2) : Promise.resolve(null)
      ]);

      // Structure data for DB and Email
      const doctor1Data = {
        fullName: formData.doc1_fullName,
        fatherName: formData.doc1_fatherHusbandName,
        dob: formData.doc1_dob,
        gender: formData.doc1_gender,
        bloodGroup: formData.doc1_bloodGroup,
        qualification: {
          degree: formData.doc1_qualificationDegree,
          university: formData.doc1_qualificationUniversity,
          year: formData.doc1_qualificationYear
        },
        registration: {
          number: formData.doc1_registrationNumber,
          date: formData.doc1_registrationDate,
          council: formData.doc1_medicalCouncil
        },
        speciality: formData.doc1_speciality,
        designation: formData.doc1_designation,
        photoUrl: photoUrl1
      };

      const doctor2Data = isCouple ? {
        fullName: formData.doc2_fullName,
        fatherName: formData.doc2_fatherHusbandName,
        dob: formData.doc2_dob,
        gender: formData.doc2_gender,
        bloodGroup: formData.doc2_bloodGroup,
        qualification: {
          degree: formData.doc2_qualificationDegree,
          university: formData.doc2_qualificationUniversity,
          year: formData.doc2_qualificationYear
        },
        registration: {
          number: formData.doc2_registrationNumber,
          date: formData.doc2_registrationDate,
          council: formData.doc2_medicalCouncil
        },
        speciality: formData.doc2_speciality,
        designation: formData.doc2_designation,
        photoUrl: photoUrl2
      } : null;

      // Save to Supabase
      const { error } = await supabase
        .from('membership_applications')
        .insert([{
          membership_type: formData.membershipType,
          full_name: formData.doc1_fullName,
          father_husband_name: formData.doc1_fatherHusbandName,
          dob: formData.doc1_dob || null,
          gender: formData.doc1_gender,
          blood_group: formData.doc1_bloodGroup,
          address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
          phone: formData.phone,
          mobile: formData.mobile,
          email: formData.email,
          registration_number: formData.doc1_registrationNumber,
          registration_date: formData.doc1_registrationDate || null,
          medical_council: formData.doc1_medicalCouncil,
          photo_url: photoUrl1,
          declaration_accepted: formData.declarationAccepted,
          status: 'pending',
          qualifications: JSON.stringify({
            doctor1: doctor1Data,
            doctor2: doctor2Data,
            common: {
              pan: formData.panNumber,
              city: formData.city,
              pincode: formData.pincode
            }
          })
        }]);

      if (error) throw error;

      // Trigger Email Edge Function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-membership-email', {
          body: {
            membershipType: formData.membershipType,
            contact: {
              mobile: formData.mobile,
              email: formData.email,
              address: formData.address,
              city: formData.city,
              pincode: formData.pincode,
              pan: formData.panNumber
            },
            doctor1: doctor1Data,
            doctor2: doctor2Data
          }
        });
        
        if (emailError) console.warn('Email notification failed:', emailError);
      } catch (emailError) {
        console.warn('Email notification failed (Network):', emailError);
      }

      toast({
        title: "Application Submitted! 🎉",
        description: "Your membership application has been received. We will review it and contact you shortly.",
        className: "bg-green-50 border-green-200"
      });

      // Reload after a short delay to show toast
      setTimeout(() => window.location.reload(), 2000);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again later. " + (error.message || ''),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PREVIEW COMPONENT ---
  if (showPreview) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 space-y-8"
      >
        <div className="text-center border-b pb-6">
          <h2 className="text-2xl font-bold text-gray-900">Review Application</h2>
          <p className="text-gray-600 mt-2">Membership Type: <span className="font-semibold text-blue-600">{formData.membershipType}</span></p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Doctor 1 Preview */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 border-b pb-2">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-800">Doctor 1 (Applicant)</h3>
            </div>
            <div className="flex justify-center my-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border shadow-sm">
                {photoPreviewUrl1 ? (
                  <img src={photoPreviewUrl1} alt="Doc 1" className="w-full h-full object-cover" />
                ) : <div className="flex items-center justify-center h-full text-gray-400"><User /></div>}
              </div>
            </div>
            <div className="space-y-2 text-sm">
               <p><span className="font-medium text-gray-500">Name:</span> {formData.doc1_fullName}</p>
               <p><span className="font-medium text-gray-500">Degree:</span> {formData.doc1_qualificationDegree}</p>
               <p><span className="font-medium text-gray-500">Reg. No:</span> {formData.doc1_registrationNumber}</p>
               <p><span className="font-medium text-gray-500">Speciality:</span> {formData.doc1_speciality}</p>
            </div>
          </div>

          {/* Doctor 2 Preview (Conditional) */}
          {isCouple && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 border-b pb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-800">Doctor 2 (Spouse)</h3>
              </div>
              <div className="flex justify-center my-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border shadow-sm">
                  {photoPreviewUrl2 ? (
                    <img src={photoPreviewUrl2} alt="Doc 2" className="w-full h-full object-cover" />
                  ) : <div className="flex items-center justify-center h-full text-gray-400"><User /></div>}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                 <p><span className="font-medium text-gray-500">Name:</span> {formData.doc2_fullName}</p>
                 <p><span className="font-medium text-gray-500">Degree:</span> {formData.doc2_qualificationDegree}</p>
                 <p><span className="font-medium text-gray-500">Reg. No:</span> {formData.doc2_registrationNumber}</p>
                 <p><span className="font-medium text-gray-500">Speciality:</span> {formData.doc2_speciality}</p>
              </div>
            </div>
          )}
        </div>

        {/* Common Info Preview */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4 mt-6">
          <h4 className="font-semibold text-gray-900 flex items-center border-b pb-2">
            <MapPin className="w-4 h-4 mr-2 text-green-600" /> Contact Details
          </h4>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
             <p><span className="font-medium text-gray-500 block text-xs uppercase">Mobile</span> {formData.mobile}</p>
             <p><span className="font-medium text-gray-500 block text-xs uppercase">Email</span> {formData.email}</p>
             <p className="sm:col-span-2"><span className="font-medium text-gray-500 block text-xs uppercase">Address</span> {formData.address}, {formData.city} - {formData.pincode}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
          <Button onClick={handleEdit} variant="outline" className="flex-1 py-6" disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Edit Details
          </Button>
          <Button onClick={handleFinalSubmit} className="flex-1 py-6 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Confirm & Submit
          </Button>
        </div>
      </motion.div>
    );
  }

  // --- MAIN FORM RENDER ---
  return (
    <form onSubmit={handleReview} className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Membership Type Selector */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" /> Membership Type
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
           {['Life Single', 'Life Couple'].map((type) => (
             <label 
                key={type}
                className={`
                  relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${formData.membershipType === type 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-blue-300'}
                `}
             >
                <input
                  type="radio"
                  name="membershipType"
                  value={type}
                  checked={formData.membershipType === type}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-bold text-sm">{type}</span>
                {formData.membershipType === type && <Check className="w-4 h-4 absolute top-2 right-2 text-blue-600" />}
             </label>
           ))}
        </div>
      </div>

      {/* Doctor 1 Form (Always Visible) */}
      <DoctorSection 
        index={1} 
        title="Doctor 1 Details" 
        icon={User} 
        colorClass="text-blue-700" 
        required={true} 
        formData={formData}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
        photoPreviewUrl={photoPreviewUrl1}
      />

      {/* Doctor 2 Form (Conditional) */}
      <AnimatePresence>
        {isCouple && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <DoctorSection 
              index={2} 
              title="Doctor 2 (Spouse) Details" 
              icon={Users} 
              colorClass="text-purple-700" 
              required={true}
              formData={formData}
              handleChange={handleChange}
              handleFileChange={handleFileChange}
              photoPreviewUrl={photoPreviewUrl2}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Common Contact Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 flex items-center mb-6">
          <MapPin className="w-5 h-5 mr-2 text-green-600" /> Contact Information (For Communication)
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
           <div className="sm:col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">Mailing Address *</label>
             <textarea
               name="address"
               required
               value={formData.address}
               onChange={handleChange}
               rows="3"
               className="w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
               placeholder="House/Clinic No, Street, Locality"
             ></textarea>
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
             <input
               type="text"
               name="city"
               required
               value={formData.city}
               onChange={handleChange}
               className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
             <input
               type="text"
               name="pincode"
               required
               value={formData.pincode}
               onChange={handleChange}
               className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
             <input
               type="tel"
               name="mobile"
               required
               value={formData.mobile}
               onChange={handleChange}
               className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
               placeholder="10-digit mobile"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
             <input
               type="email"
               name="email"
               required
               value={formData.email}
               onChange={handleChange}
               className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number (Optional)</label>
             <input
               type="text"
               name="panNumber"
               value={formData.panNumber}
               onChange={handleChange}
               className="w-full rounded-md border border-gray-300 p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
             />
           </div>
        </div>
      </div>

      {/* Declaration */}
      <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            name="declarationAccepted"
            checked={formData.declarationAccepted}
            onChange={handleChange}
            className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <div className="text-sm text-gray-700">
            <p className="font-bold text-gray-900 mb-1">Declaration</p>
            <p>I hereby declare that the statements made in this application are true and correct. I am registered with the Medical Council and I agree to abide by the rules and regulations of the Indian Medical Association.</p>
          </div>
        </label>
      </div>

      <div className="sticky bottom-4 z-10">
        <Button 
          type="submit" 
          size="lg" 
          className="w-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white text-lg py-8 rounded-xl"
        >
          Review Application <Eye className="ml-2 h-5 w-5" />
        </Button>
      </div>

    </form>
  );
};

export default MembershipApplicationForm;