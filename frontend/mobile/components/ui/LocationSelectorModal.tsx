import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { AppText as Text } from './AppText';
import {
  MapPin,
  Navigation,
  Search,
  X,
  Home,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Check,
  Phone,
  User,
  Building,
  FileText,
  Edit2,
  Compass,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../../i18n';
import { useLocationStore, type GeocodedPlace, type DeliveryLocation } from '../../store/useLocationStore';
import { useAddressStore } from '../../store/useAddressStore';
import { Palette, Radius, Spacing } from '@ashok-raj/ui';

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  mandatory?: boolean;
}

type ModalStep = 'SELECT' | 'DETAILS' | 'CONFIRM';

export function LocationSelectorModal({ visible, onClose, mandatory = false }: LocationSelectorModalProps) {
  const { isTamil } = useTranslation();
  const {
    selectedLocation,
    coverage,
    isDetectingGps,
    gpsError,
    searchResults,
    isSearching,
    searchError,
    isCheckingCoverage,
    detectGpsLocation,
    selectPlaceResult,
    selectSavedAddress,
    searchLocations,
    clearSearchResults,
    saveDetailedDeliveryAddress,
    checkServerCoverage,
  } = useLocationStore();

  const { addresses, fetchAddresses } = useAddressStore();

  // Multi-step modal navigation: SELECT -> DETAILS -> CONFIRM
  const [step, setStep] = useState<ModalStep>('SELECT');

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const searchDebounceRef = useRef<any>(null);

  // Delivery Information Form Fields
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [streetName, setStreetName] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Kalayarkoil');
  const [stateName, setStateName] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('630551');
  const [addressLabel, setAddressLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);

  // Common Delivery Instruction Quick Chips
  const instructionChips = [
    { id: 'chip-1', text: isTamil ? 'வந்ததும் அழைக்கவும்' : 'Call when you arrive', icon: '📞' },
    { id: 'chip-2', text: isTamil ? 'வாசலில் வைக்கவும்' : 'Leave at door', icon: '🚪' },
    { id: 'chip-3', text: isTamil ? 'மணி அடிக்க வேண்டாம்' : "Don't ring bell", icon: '🔕' },
    { id: 'chip-4', text: isTamil ? 'காவலரிடம் கொடுக்கவும்' : 'Leave with security', icon: '🚶' },
  ];

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (visible) {
      fetchAddresses();
      setSearchQuery('');
      clearSearchResults();
      setStep('SELECT');
      setFormErrors({});

      // Pre-populate form with existing selected address if available
      if (selectedLocation) {
        setRecipientName(selectedLocation.recipientName || '');
        setRecipientPhone(selectedLocation.recipientPhone || '');
        setHouseNumber(selectedLocation.houseNumber || '');
        setBuildingName(selectedLocation.buildingName || '');
        setStreetName(selectedLocation.streetName || '');
        setArea(selectedLocation.area || '');
        setLandmark(selectedLocation.landmark || '');
        setCity(selectedLocation.city || 'Kalayarkoil');
        setStateName(selectedLocation.state || 'Tamil Nadu');
        setPincode(selectedLocation.pincode || '630551');
        setAddressLabel(
          selectedLocation.label === 'Work' || selectedLocation.label === 'Office'
            ? 'Work'
            : selectedLocation.label === 'Other'
            ? 'Other'
            : 'Home'
        );
        setDeliveryInstructions(selectedLocation.deliveryInstructions || '');
      }
    }
  }, [visible, fetchAddresses, clearSearchResults]);

  // Debounced Place Search
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => {
      searchLocations(text);
    }, 350);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    clearSearchResults();
  };

  // Phase 1: GPS Detection & Phase 2: Automatic Address Save
  const handleUseGps = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await detectGpsLocation();

    if (result.success && result.location) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Pre-fill form from reverse-geocoded data
      setHouseNumber(result.location.houseNumber || '');
      setStreetName(result.location.streetName || '');
      setArea(result.location.area || '');
      setCity(result.location.city || 'Kalayarkoil');
      setStateName(result.location.state || 'Tamil Nadu');
      setPincode(result.location.pincode || '630551');
      setFormErrors({});
      // Smoothly transition to collect delivery information (Phase 3)
      setStep('DETAILS');
    }
  };

  // Selecting a place from search results
  const handleSelectPlace = async (place: GeocodedPlace) => {
    Haptics.selectionAsync();
    await selectPlaceResult(place);
    setStreetName(place.streetName || place.name || '');
    setArea(place.area || '');
    setCity(place.city || 'Madurai');
    setStateName(place.state || 'Tamil Nadu');
    setPincode(place.pincode || '625020');
    setHouseNumber(place.houseNumber || '');
    setFormErrors({});
    setStep('DETAILS');
  };

  // Selecting a previously saved address
  const handleSelectAddress = async (addr: any) => {
    Haptics.selectionAsync();
    await selectSavedAddress(addr);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Editing a saved address
  const handleEditSavedAddress = (addr: any) => {
    Haptics.selectionAsync();
    setHouseNumber('');
    setStreetName(addr.line1 || '');
    setArea(addr.line2 || addr.line1 || '');
    setCity(addr.city || 'Kalayarkoil');
    setStateName(addr.state || 'Tamil Nadu');
    setPincode(addr.pincode || '630551');
    setAddressLabel(
      addr.label === 'Work' || addr.label === 'Office' ? 'Work' : addr.label === 'Other' ? 'Other' : 'Home'
    );
    setFormErrors({});
    setStep('DETAILS');
  };

  // Quick chip toggle for delivery instructions
  const toggleInstructionChip = (text: string) => {
    Haptics.selectionAsync();
    if (deliveryInstructions.includes(text)) {
      setDeliveryInstructions(deliveryInstructions.replace(text, '').replace(/,\s*,/g, ',').trim());
    } else {
      const updated = deliveryInstructions ? `${deliveryInstructions}, ${text}` : text;
      setDeliveryInstructions(updated);
    }
  };

  // Validate form fields (Phase 3)
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!recipientName.trim() || recipientName.trim().length < 2) {
      errors.recipientName = isTamil ? 'பெயரை உள்ளிடவும் (குறைந்தது 2 எழுத்துக்கள்)' : 'Full name is required (min 2 characters)';
    }

    const cleanPhone = recipientPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errors.recipientPhone = isTamil ? '10 இலக்க செல்போன் எண்ணை உள்ளிடவும்' : 'Valid 10-digit mobile number is required';
    }

    if (!houseNumber.trim()) {
      errors.houseNumber = isTamil ? 'வீட்டு / பிளாட் எண் தேவை' : 'House / Flat / Door number is required';
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      errors.pincode = isTamil ? '6 இலக்க அஞ்சல் குறியீட்டை உள்ளிடவும்' : 'Valid 6-digit pincode is required';
    }

    if (!streetName.trim() && !area.trim()) {
      errors.streetName = isTamil ? 'தெரு அல்லது பகுதியை உள்ளிடவும்' : 'Street or area name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit delivery form (Phase 3 & 4)
  const handleSaveDeliveryDetails = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setIsSubmittingDetails(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const success = await saveDetailedDeliveryAddress({
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      houseNumber: houseNumber.trim(),
      buildingName: buildingName.trim() || undefined,
      streetName: streetName.trim() || area.trim(),
      area: area.trim() || streetName.trim(),
      landmark: landmark.trim() || undefined,
      city: city.trim(),
      state: stateName.trim() || 'Tamil Nadu',
      pincode: pincode.trim(),
      label: addressLabel,
      deliveryInstructions: deliveryInstructions.trim() || undefined,
    });

    setIsSubmittingDetails(false);

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Advance to Confirmation screen (Phase 4 & 5)
      setStep('CONFIRM');
    } else {
      Alert.alert(
        isTamil ? 'பிழை' : 'Error',
        isTamil ? 'முகவரியைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Failed to save address. Please try again.'
      );
    }
  };

  // Final confirmation to close and start ordering
  const handleConfirmAndStartOrdering = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  const getLabelIcon = (lbl: string) => {
    switch (lbl) {
      case 'Home':
        return <Home size={16} color="#2563EB" />;
      case 'Work':
      case 'Office':
        return <Briefcase size={16} color="#2563EB" />;
      default:
        return <MapPin size={16} color="#2563EB" />;
    }
  };

  const handleCloseAttempt = () => {
    const hasValidAddress = Boolean(
      (selectedLocation?.address && selectedLocation.address !== 'Kalaiyarkoil, Tamil Nadu') ||
      (addresses && addresses.length > 0)
    );

    if (mandatory && !hasValidAddress) {
      Alert.alert(
        isTamil ? 'டெலிவரி இருப்பிடம் தேவை' : 'Delivery Location Required',
        isTamil
          ? 'டெலிவரி ஆர்டர் செய்ய உங்கள் இருப்பிடத்தைத் தேர்ந்தெடுக்கவும் அல்லது உள்ளிடவும்.'
          : 'Please select or enter your delivery location before proceeding with delivery orders.',
        [{ text: isTamil ? 'சரி' : 'OK' }]
      );
      return;
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleCloseAttempt}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Grab Handle */}
          <View style={styles.dragHandle} />

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 1: LOCATION SELECTION (Default Discovery Screen)
             ══════════════════════════════════════════════════════════════════ */}
          {step === 'SELECT' && (
            <>
              {/* Header */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.headerTitle}>
                    {isTamil ? 'டெலிவரி முகவரி' : 'Deliver to'}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {isTamil
                      ? 'உங்கள் ஆர்டர் எங்கு டெலிவரி செய்யப்பட வேண்டும்?'
                      : 'Choose where you want your order delivered'}
                  </Text>
                </View>
                {(!mandatory || Boolean(selectedLocation?.address && selectedLocation.address !== 'Kalaiyarkoil, Tamil Nadu')) && (
                  <TouchableOpacity onPress={handleCloseAttempt} style={styles.closeButton} activeOpacity={0.7}>
                    <X size={20} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Search Input */}
              <View style={styles.searchBox}>
                <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  placeholder={
                    isTamil
                      ? 'பகுதி, தெரு, அல்லது அஞ்சல் குறியீட்டைத் தேடவும்...'
                      : 'Search an area, street, landmark or PIN code...'
                  }
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                  returnKeyType="search"
                />
                {isSearching ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : searchQuery.length > 0 ? (
                  <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={16} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Search Results Dropdown / Autocomplete */}
              {searchQuery.trim().length > 0 && (
                <ScrollView style={styles.searchResultsContainer} keyboardShouldPersistTaps="handled">
                  {searchError ? (
                    <View style={styles.emptySearchBox}>
                      <AlertCircle size={20} color="#F59E0B" />
                      <Text style={styles.emptySearchText}>{searchError}</Text>
                    </View>
                  ) : (
                    searchResults.map((place) => (
                      <TouchableOpacity
                        key={place.id}
                        onPress={() => handleSelectPlace(place)}
                        style={styles.searchResultItem}
                        activeOpacity={0.7}
                      >
                        <View style={styles.searchResultIcon}>
                          <MapPin size={18} color="#2563EB" />
                        </View>
                        <View style={styles.searchResultTextWrap}>
                          <Text style={styles.searchResultName}>{place.name}</Text>
                          <Text style={styles.searchResultAddress} numberOfLines={2}>
                            {place.formattedAddress}
                          </Text>
                        </View>
                        <ChevronRight size={16} color="#CBD5E1" />
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              )}

              {/* Main Content (when not searching) */}
              {searchQuery.trim().length === 0 && (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                  {/* Option 1: Use Current Location (GPS) */}
                  <TouchableOpacity
                    onPress={handleUseGps}
                    disabled={isDetectingGps}
                    style={styles.gpsButton}
                    activeOpacity={0.85}
                  >
                    <View style={styles.gpsIconBadge}>
                      {isDetectingGps ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                      ) : (
                        <Navigation size={20} color="#2563EB" />
                      )}
                    </View>
                    <View style={styles.gpsTextWrap}>
                      <Text style={styles.gpsTitle}>
                        {isTamil ? 'தற்போதைய இருப்பிடத்தைப் பயன்படுத்து' : 'Use current location'}
                      </Text>
                      <Text style={styles.gpsSubtitle}>
                        {isDetectingGps
                          ? isTamil
                            ? 'இருப்பிடத்தை கண்டறிகிறது...'
                            : 'Detecting your GPS location...'
                          : isTamil
                          ? 'ஜிபிஎஸ் மூலம் துல்லியமாக அறியவும்'
                          : 'Detect your location using GPS'}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#2563EB" />
                  </TouchableOpacity>

                  {/* GPS Error Banner if any */}
                  {gpsError && (
                    <View style={styles.gpsErrorBanner}>
                      <AlertCircle size={16} color="#DC2626" />
                      <Text style={styles.gpsErrorText}>{gpsError}</Text>
                    </View>
                  )}

                  {/* Delivery Coverage Status for Currently Selected Location */}
                  <View
                    style={[
                      styles.coverageCard,
                      coverage.isDeliverable
                        ? styles.coverageOk
                        : coverage.status === 'UNVERIFIABLE'
                        ? styles.coverageNeutral
                        : styles.coverageWarning,
                    ]}
                  >
                    {/* Selected Destination Header with Change Button */}
                    <View style={styles.coverageAddressHeader}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.coverageAddressSub}>
                          {isTamil ? 'டெலிவரி முகவரி' : 'DELIVER TO'}
                        </Text>
                        <Text style={styles.coverageAddressMain} numberOfLines={2}>
                          {selectedLocation?.address || (isTamil ? 'காளையார்கோவில் நகர்' : 'Kalaiyarkoil Town')}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.selectionAsync();
                          setStep('DETAILS');
                        }}
                        style={styles.changeAddressBtn}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.changeAddressBtnText}>
                          {isTamil ? 'மாற்று' : 'Change'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Availability Status Badge & Distance Row */}
                    <View style={styles.coverageStatusRow}>
                      <View style={styles.coverageStatusBadge}>
                        {coverage.isDeliverable ? (
                          <CheckCircle2 size={16} color="#16A34A" />
                        ) : coverage.status === 'UNVERIFIABLE' ? (
                          <Compass size={16} color="#64748B" />
                        ) : (
                          <AlertCircle size={16} color="#D97706" />
                        )}
                        <Text
                          style={[
                            styles.coverageTitle,
                            {
                              color: coverage.isDeliverable
                                ? '#15803D'
                                : coverage.status === 'UNVERIFIABLE'
                                ? '#475569'
                                : '#B45309',
                            },
                          ]}
                        >
                          {coverage.isDeliverable
                            ? isTamil
                              ? 'டெலிவரி கிடைக்கும்'
                              : 'Delivery Available'
                            : coverage.status === 'UNVERIFIABLE'
                            ? isTamil
                              ? 'டெலிவரி கிடைப்பதை உறுதிப்படுத்த முடியவில்லை'
                              : 'Unable to verify delivery availability'
                            : isTamil
                            ? 'நிலையான டெலிவரி பகுதிக்கு வெளியே உள்ளது'
                            : 'Outside Standard Delivery Area'}
                        </Text>
                      </View>

                      {/* Clearly labelled Distance */}
                      {coverage.distanceKm != null && (
                        <View style={styles.distanceBadge}>
                          <MapPin size={12} color="#475569" />
                          <Text style={styles.distanceBadgeText}>
                            {coverage.distanceLabel ||
                              `${coverage.distanceKm} km (${
                                coverage.distanceType === 'road'
                                  ? isTamil
                                    ? 'சாலை தூரம்'
                                    : 'Road distance'
                                  : isTamil
                                  ? 'நேரடி தூரம்'
                                  : 'Straight-line distance'
                              })`}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Branch Info */}
                    <Text style={styles.coverageBranchText}>
                      {isTamil
                        ? `${coverage.nearestBranchName || 'அசோக் ராஜ் தங்குமிடம் மற்றும் உணவகம்'}-லிருந்து`
                        : `From: ${coverage.nearestBranchName || 'Ashok Raj Lodge & Restaurant A/C'}`}
                    </Text>

                    <Text style={styles.coverageMessage}>{coverage.message}</Text>

                    {/* Estimated time and fee ONLY when supported by configured rules (isDeliverable) */}
                    {coverage.isDeliverable && coverage.estimatedMinutes != null && (
                      <View style={styles.coverageMetaRow}>
                        <View style={styles.coverageMetaItem}>
                          <Clock size={12} color="#2563EB" />
                          <Text style={styles.coverageMetaText}>~{coverage.estimatedMinutes} mins</Text>
                        </View>
                        <View style={styles.coverageMetaItem}>
                          <ShieldCheck size={12} color="#16A34A" />
                          <Text style={styles.coverageMetaText}>
                            {coverage.deliveryFee === 0
                              ? isTamil
                                ? 'இலவச டெலிவரி'
                                : 'FREE Delivery'
                              : `Delivery: ₹${coverage.deliveryFee}`}
                          </Text>
                        </View>
                        {coverage.minOrderAmount != null && coverage.minOrderAmount > 0 && (
                          <View style={styles.coverageMetaItem}>
                            <Text style={styles.coverageMetaTextSub}>
                              (Min: ₹{coverage.minOrderAmount})
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Saved Addresses Section */}
                  <View style={styles.savedSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionTitle}>
                        {isTamil ? 'சேமிக்கப்பட்ட முகவரிகள்' : 'Saved Addresses'}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.selectionAsync();
                          setStep('DETAILS');
                        }}
                        style={styles.addAddressTrigger}
                        activeOpacity={0.7}
                      >
                        <Plus size={15} color="#2563EB" />
                        <Text style={styles.addAddressTriggerText}>
                          {isTamil ? 'புதிய முகவரி' : 'Add New'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* List of Saved Addresses */}
                    {addresses.length === 0 ? (
                      <View style={styles.emptySavedBox}>
                        <Text style={styles.emptySavedText}>
                          {isTamil
                            ? 'சேமிக்கப்பட்ட முகவரிகள் எதுவும் இல்லை. விரைவான ஆர்டருக்கு புதிய முகவரியைச் சேர்க்கவும்.'
                            : 'No saved addresses yet. Tap above to detect GPS or add an address.'}
                        </Text>
                      </View>
                    ) : (
                      addresses.map((addr) => {
                        const isSelected = selectedLocation.address.includes(addr.line1) || selectedLocation.id === addr.id;
                        return (
                          <TouchableOpacity
                            key={addr.id}
                            onPress={() => handleSelectAddress(addr)}
                            style={[styles.savedAddressCard, isSelected && styles.savedAddressCardActive]}
                            activeOpacity={0.8}
                          >
                            <View style={styles.savedAddressLeft}>
                              <View style={[styles.savedAddressIcon, isSelected && { backgroundColor: '#2563EB' }]}>
                                {React.cloneElement(getLabelIcon(addr.label), {
                                  color: isSelected ? '#FFFFFF' : '#2563EB',
                                })}
                              </View>
                              <View style={styles.savedAddressDetails}>
                                <View style={styles.savedAddressLabelRow}>
                                  <Text style={styles.savedAddressLabel}>{addr.label}</Text>
                                  {addr.isDefault && (
                                    <View style={styles.defaultPill}>
                                      <Text style={styles.defaultPillText}>DEFAULT</Text>
                                    </View>
                                  )}
                                </View>
                                <Text style={styles.savedAddressLine} numberOfLines={2}>
                                  {addr.line1}
                                  {addr.line2 ? `, ${addr.line2}` : ''}, {addr.city} - {addr.pincode}
                                </Text>
                              </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                              <TouchableOpacity
                                onPress={() => handleEditSavedAddress(addr)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Edit2 size={16} color="#94A3B8" />
                              </TouchableOpacity>
                              <View style={styles.radioWrap}>
                                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                                  {isSelected && <View style={styles.radioDot} />}
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>
                </ScrollView>
              )}

              {/* Bottom Continue Action */}
              <View style={styles.footerContainer}>
                <TouchableOpacity onPress={onClose} style={styles.confirmButton} activeOpacity={0.85}>
                  <Text style={styles.confirmButtonText}>
                    {isTamil ? 'தேர்வை உறுதிசெய்' : 'Confirm & Continue'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 2: DELIVERY INFORMATION FORM (Phase 3)
             ══════════════════════════════════════════════════════════════════ */}
          {step === 'DETAILS' && (
            <>
              {/* Header with Back Arrow */}
              <View style={styles.headerRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setStep('SELECT')}
                    style={styles.backButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <ArrowLeft size={20} color="#0F172A" />
                  </TouchableOpacity>
                  <View>
                    <Text style={styles.headerTitle}>
                      {isTamil ? 'டெலிவரி விவரங்கள்' : 'Delivery Details'}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                      {isTamil ? 'சரியான விநியோகத்திற்கு விவரங்களை உள்ளிடவும்' : 'Enter recipient and doorstep delivery details'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScrollContent}>
                {/* Detected Location Badge */}
                <View style={styles.locationBadgeBanner}>
                  <View style={styles.badgePinIcon}>
                    <Compass size={18} color="#2563EB" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.badgeAreaText} numberOfLines={1}>
                      {area || streetName ? `${area || streetName}, ${city}` : 'Detected Location'}
                    </Text>
                    <Text style={styles.badgeCoordText}>
                      {selectedLocation.latitude && selectedLocation.longitude
                        ? `GPS: ${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)} · High Accuracy`
                        : 'Coordinates verified for delivery'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setStep('SELECT')}>
                    <Text style={styles.badgeChangeText}>{isTamil ? 'மாற்று' : 'Change'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Section 1: Recipient Information */}
                <Text style={styles.formSectionHeader}>
                  {isTamil ? 'பெறுநர் விவரங்கள்' : 'Recipient Information'}
                </Text>

                {/* Full Name */}
                <View style={styles.fieldContainer}>
                  <View style={styles.inputWithIcon}>
                    <User size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                    <TextInput
                      value={recipientName}
                      onChangeText={(val) => {
                        setRecipientName(val);
                        if (formErrors.recipientName) setFormErrors({ ...formErrors, recipientName: '' });
                      }}
                      placeholder={isTamil ? 'பெறுநர் முழுப் பெயர் *' : "Recipient's full name *"}
                      placeholderTextColor="#94A3B8"
                      style={styles.fieldTextInput}
                    />
                  </View>
                  {formErrors.recipientName && (
                    <Text style={styles.inlineErrorText}>{formErrors.recipientName}</Text>
                  )}
                </View>

                {/* Mobile Number with +91 prefix */}
                <View style={styles.fieldContainer}>
                  <View style={styles.inputWithIcon}>
                    <Phone size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                    <Text style={styles.countryCodePrefix}>+91</Text>
                    <TextInput
                      value={recipientPhone}
                      onChangeText={(val) => {
                        const cleaned = val.replace(/\D/g, '').slice(0, 10);
                        setRecipientPhone(cleaned);
                        if (formErrors.recipientPhone) setFormErrors({ ...formErrors, recipientPhone: '' });
                      }}
                      placeholder={isTamil ? '10 இலக்க மொபைல் எண் *' : '10-digit mobile number *'}
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      maxLength={10}
                      style={styles.fieldTextInput}
                    />
                  </View>
                  {formErrors.recipientPhone && (
                    <Text style={styles.inlineErrorText}>{formErrors.recipientPhone}</Text>
                  )}
                </View>

                {/* Section 2: Complete Address Details */}
                <Text style={styles.formSectionHeader}>
                  {isTamil ? 'முழுமையான முகவரி' : 'Complete Delivery Address'}
                </Text>

                {/* House/Flat/Door Number */}
                <View style={styles.fieldContainer}>
                  <View style={styles.inputWithIcon}>
                    <Home size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                    <TextInput
                      value={houseNumber}
                      onChangeText={(val) => {
                        setHouseNumber(val);
                        if (formErrors.houseNumber) setFormErrors({ ...formErrors, houseNumber: '' });
                      }}
                      placeholder={isTamil ? 'வீட்டு எண் / பிளாட் எண் / கதவு எண் *' : 'House / Flat / Door number * (e.g. Door No. 14, 2nd Floor)'}
                      placeholderTextColor="#94A3B8"
                      style={styles.fieldTextInput}
                    />
                  </View>
                  {formErrors.houseNumber && (
                    <Text style={styles.inlineErrorText}>{formErrors.houseNumber}</Text>
                  )}
                </View>

                {/* Building / Apartment Name (Optional) */}
                <View style={styles.fieldContainer}>
                  <View style={styles.inputWithIcon}>
                    <Building size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                    <TextInput
                      value={buildingName}
                      onChangeText={setBuildingName}
                      placeholder={isTamil ? 'கட்டிடம் / அடுக்குமாடி பெயர் (விருப்பம்)' : 'Building / Apartment Name (optional)'}
                      placeholderTextColor="#94A3B8"
                      style={styles.fieldTextInput}
                    />
                  </View>
                </View>

                {/* Street & Area */}
                <View style={styles.fieldContainer}>
                  <View style={styles.formRow}>
                    <TextInput
                      value={streetName}
                      onChangeText={setStreetName}
                      placeholder={isTamil ? 'தெரு பெயர் *' : 'Street Name *'}
                      placeholderTextColor="#94A3B8"
                      style={[styles.fieldTextInputBox, { flex: 1, marginRight: 8 }]}
                    />
                    <TextInput
                      value={area}
                      onChangeText={setArea}
                      placeholder={isTamil ? 'பகுதி / பகுதிப் பெயர் *' : 'Area / Locality *'}
                      placeholderTextColor="#94A3B8"
                      style={[styles.fieldTextInputBox, { flex: 1 }]}
                    />
                  </View>
                  {formErrors.streetName && (
                    <Text style={styles.inlineErrorText}>{formErrors.streetName}</Text>
                  )}
                </View>

                {/* Landmark (Optional) */}
                <View style={styles.fieldContainer}>
                  <TextInput
                    value={landmark}
                    onChangeText={setLandmark}
                    placeholder={isTamil ? 'அடையாளம் (எ.கா. பேருந்து நிலையம் அருகில் / கோயில் எதிரில்)' : 'Landmark (optional, e.g. Near Bus Stand, Opposite Temple)'}
                    placeholderTextColor="#94A3B8"
                    style={styles.fieldTextInputBox}
                  />
                </View>

                {/* City & PIN Code */}
                <View style={styles.fieldContainer}>
                  <View style={styles.formRow}>
                    <TextInput
                      value={city}
                      onChangeText={setCity}
                      placeholder={isTamil ? 'நகரம்' : 'City'}
                      placeholderTextColor="#94A3B8"
                      style={[styles.fieldTextInputBox, { flex: 1, marginRight: 8 }]}
                    />
                    <TextInput
                      value={pincode}
                      onChangeText={(val) => {
                        const cleaned = val.replace(/\D/g, '').slice(0, 6);
                        setPincode(cleaned);
                        if (formErrors.pincode) setFormErrors({ ...formErrors, pincode: '' });
                      }}
                      placeholder={isTamil ? 'அஞ்சல் குறியீடு (6 இலக்கங்கள்) *' : 'PIN Code (6 digits) *'}
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={6}
                      style={[styles.fieldTextInputBox, { flex: 1 }]}
                    />
                  </View>
                  {formErrors.pincode && (
                    <Text style={styles.inlineErrorText}>{formErrors.pincode}</Text>
                  )}
                </View>

                {/* Section 3: Address Label Selection */}
                <Text style={styles.formSectionHeader}>
                  {isTamil ? 'முகவரி வகை' : 'Save Address As'}
                </Text>
                <View style={styles.labelChipsRow}>
                  {[
                    { id: 'Home', label: isTamil ? 'வீடு' : 'Home', icon: Home },
                    { id: 'Work', label: isTamil ? 'பணி' : 'Work', icon: Briefcase },
                    { id: 'Other', label: isTamil ? 'மற்றவை' : 'Other', icon: MapPin },
                  ].map((item) => {
                    const isActive = addressLabel === item.id;
                    const IconComp = item.icon;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setAddressLabel(item.id as any);
                        }}
                        style={[styles.detailedLabelChip, isActive && styles.detailedLabelChipActive]}
                        activeOpacity={0.8}
                      >
                        <IconComp size={15} color={isActive ? '#FFFFFF' : '#475569'} />
                        <Text style={[styles.detailedLabelText, isActive && styles.detailedLabelTextActive]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Section 4: Delivery Preferences & Instructions */}
                <Text style={styles.formSectionHeader}>
                  {isTamil ? 'டெலிவரி விருப்பங்கள் & குறிப்புகள்' : 'Delivery Preferences & Instructions'}
                </Text>
                <View style={styles.instructionChipsWrap}>
                  {instructionChips.map((chip) => {
                    const isSelected = deliveryInstructions.includes(chip.text);
                    return (
                      <TouchableOpacity
                        key={chip.id}
                        onPress={() => toggleInstructionChip(chip.text)}
                        style={[styles.instructionChip, isSelected && styles.instructionChipActive]}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.instructionChipEmoji}>{chip.icon}</Text>
                        <Text style={[styles.instructionChipText, isSelected && styles.instructionChipTextActive]}>
                          {chip.text}
                        </Text>
                        {isSelected && <Check size={13} color="#2563EB" strokeWidth={2.5} style={{ marginLeft: 3 }} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Delivery Instructions Box */}
                <View style={styles.fieldContainer}>
                  <View style={styles.inputWithIcon}>
                    <FileText size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                    <TextInput
                      value={deliveryInstructions}
                      onChangeText={setDeliveryInstructions}
                      placeholder={isTamil ? 'கூடுதல் குறிப்புகள் (எ.கா. கதவு மணி பழுது)' : 'Optional delivery notes for rider...'}
                      placeholderTextColor="#94A3B8"
                      style={styles.fieldTextInput}
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Save Address Button */}
              <View style={styles.footerContainer}>
                <TouchableOpacity
                  onPress={handleSaveDeliveryDetails}
                  disabled={isSubmittingDetails}
                  style={styles.confirmButton}
                  activeOpacity={0.85}
                >
                  {isSubmittingDetails ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      {isTamil ? 'சேமித்து டெலிவரியைச் சரிபார்க்கவும்' : 'Save Address & Check Delivery'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW 3: DELIVERY ADDRESS CONFIRMATION (Phase 4 & 5)
             ══════════════════════════════════════════════════════════════════ */}
          {step === 'CONFIRM' && (
            <>
              {/* Header */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.headerTitle}>
                    {isTamil ? 'டெலிவரி உறுதிப்படுத்தல்' : 'Delivery Confirmation'}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {isTamil ? 'உங்கள் முகவரி வெற்றிகரமாகச் சேமிக்கப்பட்டது' : 'Address saved and verified with branch coverage'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Completed Address Summary Card */}
                <View style={styles.confirmationSummaryCard}>
                  <View style={styles.summaryTopRow}>
                    <View style={styles.summaryLabelBadge}>
                      {getLabelIcon(selectedLocation.label)}
                      <Text style={styles.summaryLabelBadgeText}>{selectedLocation.label.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setStep('DETAILS')}
                      style={styles.editLinkBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Edit2 size={14} color="#2563EB" />
                      <Text style={styles.editLinkText}>{isTamil ? 'திருத்து' : 'Edit'}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Recipient Details */}
                  {selectedLocation.recipientName && (
                    <Text style={styles.summaryRecipientText}>
                      {selectedLocation.recipientName} · {selectedLocation.recipientPhone}
                    </Text>
                  )}

                  {/* Full Address */}
                  <Text style={styles.summaryAddressText}>
                    {selectedLocation.address}
                  </Text>

                  {/* Delivery Instructions */}
                  {selectedLocation.deliveryInstructions && (
                    <View style={styles.summaryInstructionsBox}>
                      <Text style={styles.summaryInstructionsLabel}>
                        {isTamil ? 'டெலிவரி குறிப்பு:' : 'Delivery Note:'}
                      </Text>
                      <Text style={styles.summaryInstructionsValue}>
                        {selectedLocation.deliveryInstructions}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Server-Side Branch Delivery Availability Card (Phase 5) */}
                <View
                  style={[
                    styles.coverageConfirmationCard,
                    coverage.isDeliverable ? styles.coverageOk : styles.coverageWarning,
                  ]}
                >
                  <View style={styles.coverageHeader}>
                    {coverage.isDeliverable ? (
                      <CheckCircle2 size={22} color="#16A34A" />
                    ) : (
                      <AlertCircle size={22} color="#D97706" />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.coverageConfirmTitle,
                          { color: coverage.isDeliverable ? '#15803D' : coverage.status === 'UNVERIFIABLE' ? '#475569' : '#B45309' },
                        ]}
                      >
                        {coverage.isDeliverable
                          ? isTamil ? 'டெலிவரி கிடைக்கிறது!' : 'Delivery Available!'
                          : coverage.status === 'UNVERIFIABLE'
                          ? isTamil ? 'டெலிவரி கிடைப்பதை உறுதிப்படுத்த முடியவில்லை' : 'Unable to verify delivery availability'
                          : isTamil ? 'டெலிவரி எல்லைக்கு வெளியே உள்ளது' : 'Outside Standard Delivery Area'}
                      </Text>
                      {coverage.distanceKm != null && (
                        <Text style={styles.coverageBranchText}>
                          📍 {coverage.distanceLabel || `${coverage.distanceKm} km`} • {coverage.nearestBranchName || 'Ashok Raj Lodge & Restaurant A/C'}
                        </Text>
                      )}
                      <Text style={styles.coverageConfirmSubtitle}>{coverage.message}</Text>
                    </View>
                  </View>

                  {coverage.isDeliverable && (
                    <View style={styles.coverageMetricsRow}>
                      <View style={styles.metricCard}>
                        <Clock size={16} color="#2563EB" />
                        <Text style={styles.metricValue}>~{coverage.estimatedMinutes} mins</Text>
                        <Text style={styles.metricLabel}>{isTamil ? 'மதிப்பிடப்பட்ட நேரம்' : 'Estimated Time'}</Text>
                      </View>
                      <View style={styles.metricCard}>
                        <ShieldCheck size={16} color="#16A34A" />
                        <Text style={styles.metricValue}>
                          {coverage.deliveryFee === 0 ? 'FREE' : `₹${coverage.deliveryFee}`}
                        </Text>
                        <Text style={styles.metricLabel}>{isTamil ? 'டெலிவரி கட்டணம்' : 'Delivery Fee'}</Text>
                      </View>
                    </View>
                  )}

                  {!coverage.isDeliverable && (
                    <View style={styles.nonDeliverableHelpBox}>
                      <Text style={styles.nonDeliverableHelpText}>
                        {isTamil
                          ? 'இந்த முகவரிக்கு ஆன்லைன் டெலிவரி வசதி தற்போது இல்லை. உணவகத்தில் சாப்பிட அல்லது பார்சல் பெறலாம்.'
                          : 'Online delivery is currently not serving this distance. You can still order for Self-Takeaway or visit our Dine-in table service.'}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Confirm & Start Ordering Footer */}
              <View style={styles.footerContainer}>
                <TouchableOpacity
                  onPress={handleConfirmAndStartOrdering}
                  style={styles.confirmButton}
                  activeOpacity={0.85}
                >
                  <Text style={styles.confirmButtonText}>
                    {isTamil ? 'உறுதி செய்து ஆர்டர் செய்யத் தொடங்குங்கள்' : 'Confirm & Start Ordering'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStep('DETAILS')}
                  style={styles.editOutlineBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editOutlineBtnText}>
                    {isTamil ? 'முகவரியைத் திருத்து' : 'Edit Address Details'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    ...Platform.select({
      web: {
        boxShadow: '0 -8px 28px rgba(0, 0, 0, 0.18)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 16,
      },
    }),
  },
  dragHandle: {
    width: 44,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.xl,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  searchResultsContainer: {
    maxHeight: 280,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  searchResultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultTextWrap: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchResultAddress: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  emptySearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#FFFBEB',
    borderRadius: Radius.lg,
    gap: 8,
    marginTop: 8,
  },
  emptySearchText: {
    fontSize: 13,
    color: '#B45309',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderRadius: Radius.xl,
    borderWidth: 1.2,
    borderColor: '#BFDBFE',
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    gap: 12,
  },
  gpsIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsTextWrap: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  gpsSubtitle: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 1,
  },
  gpsErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    gap: 8,
    marginTop: 4,
  },
  gpsErrorText: {
    fontSize: 12,
    color: '#B91C1C',
    flex: 1,
  },
  coverageCard: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1.2,
  },
  coverageOk: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  coverageWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  coverageNeutral: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  coverageAddressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  coverageAddressSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  coverageAddressMain: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  changeAddressBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  changeAddressBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  coverageStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 4,
  },
  coverageStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  distanceBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  coverageBranchText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  coverageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  coverageTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  coverageMessage: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  coverageMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  coverageMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  coverageMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  coverageMetaTextSub: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  savedSection: {
    marginTop: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  addAddressTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    backgroundColor: '#EFF6FF',
  },
  addAddressTriggerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptySavedBox: {
    padding: Spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptySavedText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  savedAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  savedAddressCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FAFC',
  },
  savedAddressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  savedAddressIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedAddressDetails: {
    flex: 1,
  },
  savedAddressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savedAddressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  defaultPill: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3730A3',
  },
  savedAddressLine: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  radioWrap: {
    paddingLeft: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#2563EB',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  footerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    gap: 8,
  },
  confirmButton: {
    backgroundColor: '#2563EB',
    borderRadius: Radius.xl,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
      },
      default: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.24,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* ── Form View Styles ── */
  formScrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  locationBadgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgePinIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeAreaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  badgeCoordText: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 1,
  },
  badgeChangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  formSectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 8,
  },
  fieldContainer: {
    marginBottom: 10,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.lg,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  countryCodePrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 6,
  },
  fieldTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  fieldTextInputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.lg,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#0F172A',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineErrorText: {
    fontSize: 11.5,
    color: '#DC2626',
    marginTop: 3,
    marginLeft: 4,
    fontWeight: '500',
  },
  labelChipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  detailedLabelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.full,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  detailedLabelChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  detailedLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  detailedLabelTextActive: {
    color: '#FFFFFF',
  },
  instructionChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  instructionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: Radius.full,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  instructionChipActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  instructionChipEmoji: {
    fontSize: 13,
    marginRight: 5,
  },
  instructionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  instructionChipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },

  /* ── Confirmation View Styles ── */
  confirmationSummaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  summaryLabelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  editLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  summaryRecipientText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  summaryAddressText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  summaryInstructionsBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryInstructionsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  summaryInstructionsValue: {
    fontSize: 12,
    color: '#1E293B',
    flex: 1,
  },
  coverageConfirmationCard: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1.2,
    marginBottom: Spacing.md,
  },
  coverageConfirmTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  coverageConfirmSubtitle: {
    fontSize: 12.5,
    color: '#475569',
    marginTop: 2,
    lineHeight: 18,
  },
  coverageMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  nonDeliverableHelpBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  nonDeliverableHelpText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  editOutlineBtn: {
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.xl,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  editOutlineBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
