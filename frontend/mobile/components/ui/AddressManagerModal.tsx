import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AppText as Text } from './AppText';
import {
  MapPin,
  Plus,
  Trash2,
  Check,
  X,
  Home,
  Briefcase,
  Navigation,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../../i18n';
import { useAddressStore } from '../../store/useAddressStore';

interface AddressManagerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAddress?: (addressId: string) => void;
}

export function AddressManagerModal({
  visible,
  onClose,
  onSelectAddress,
}: AddressManagerModalProps) {
  const { isTamil } = useTranslation();
  const {
    addresses,
    selectedAddressId,
    fetchAddresses,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    selectAddress,
  } = useAddressStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState<'Home' | 'Office' | 'Other'>('Home');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('Kalaiyarkoil');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('630551');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchAddresses();
    }
  }, [visible, fetchAddresses]);

  const handleSaveAddress = async () => {
    if (!line1.trim() || line1.length < 5) {
      Alert.alert(
        isTamil ? 'முகவரி தேவை' : 'Address Required',
        isTamil
          ? 'தயவுசெய்து முழுமையான முகவரியை உள்ளிடவும் (குறைந்தது 5 எழுத்துக்கள்)'
          : 'Please enter a complete address (minimum 5 characters)'
      );
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      Alert.alert(
        isTamil ? 'தவறான அஞ்சல் குறியீடு' : 'Invalid Pincode',
        isTamil ? '6 இலக்க அஞ்சல் குறியீட்டை உள்ளிடவும்' : 'Please enter a valid 6-digit pincode'
      );
      return;
    }

    setIsSubmitting(true);
    Haptics.selectionAsync();

    const created = await addAddress({
      label,
      line1: line1.trim(),
      line2: line2.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault,
    });

    setIsSubmitting(false);

    if (created) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAddForm(false);
      setLine1('');
      setLine2('');
      setIsDefault(false);
    }
  };

  const handleDelete = (id: string, addrLabel: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      isTamil ? 'முகவரியை நீக்கவா?' : 'Delete Address?',
      isTamil
        ? `"${addrLabel}" முகவரியை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`
        : `Are you sure you want to delete "${addrLabel}"?`,
      [
        { text: isTamil ? 'ரத்து' : 'Cancel', style: 'cancel' },
        {
          text: isTamil ? 'நீக்கு' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAddress(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const getLabelIcon = (lbl: string) => {
    switch (lbl) {
      case 'Home':
        return <Home size={16} color="#2563EB" />;
      case 'Office':
        return <Briefcase size={16} color="#2563EB" />;
      default:
        return <MapPin size={16} color="#2563EB" />;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconWrap}>
                <Navigation size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {isTamil ? 'சேமிக்கப்பட்ட முகவரிகள்' : 'Saved Addresses'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {isTamil ? 'டெலிவரி மற்றும் ஆர்டர்களுக்கான முகவரிகள்' : 'Manage your delivery locations'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Address List */}
            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.addressCard,
                    addr.isDefault && styles.defaultAddressCard,
                    isSelected && styles.selectedAddressCard,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => {
                    selectAddress(addr.id);
                    if (onSelectAddress) {
                      onSelectAddress(addr.id);
                    }
                  }}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.labelBadge}>
                      {getLabelIcon(addr.label)}
                      <Text style={styles.labelText}>{addr.label}</Text>
                    </View>

                    <View style={styles.cardActions}>
                      {addr.isDefault ? (
                        <View style={styles.defaultPill}>
                          <Check size={12} color="#16A34A" />
                          <Text style={styles.defaultPillText}>
                            {isTamil ? 'இயல்புநிலை' : 'Default'}
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.makeDefaultBtn}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setDefaultAddress(addr.id);
                          }}
                        >
                          <Text style={styles.makeDefaultText}>
                            {isTamil ? 'இயல்பாக்கு' : 'Set as Default'}
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() => handleDelete(addr.id, addr.label)}
                        style={styles.deleteBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.line1Text}>{addr.line1}</Text>
                  {addr.line2 ? <Text style={styles.line2Text}>{addr.line2}</Text> : null}
                  <Text style={styles.cityPincodeText}>
                    {addr.city}, {addr.state} - {addr.pincode}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Add New Address Form / Button */}
            {!showAddForm ? (
              <TouchableOpacity
                style={styles.addNewBtn}
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowAddForm(true);
                }}
              >
                <Plus size={20} color="#2563EB" />
                <Text style={styles.addNewBtnText}>
                  {isTamil ? '+ புதிய முகவரி சேர்க்க' : '+ Add New Address'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.formContainer}>
                <View style={styles.formHeaderRow}>
                  <Text style={styles.formTitle}>
                    {isTamil ? 'புதிய முகவரி விவரங்கள்' : 'New Address Details'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowAddForm(false)}>
                    <Text style={styles.cancelFormText}>{isTamil ? 'ரத்து' : 'Cancel'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Label Selector Pills */}
                <Text style={styles.inputLabel}>{isTamil ? 'முகவரி வகை' : 'Address Label'}</Text>
                <View style={styles.labelRow}>
                  {(['Home', 'Office', 'Other'] as const).map((lbl) => (
                    <TouchableOpacity
                      key={lbl}
                      style={[styles.pill, label === lbl && styles.pillActive]}
                      onPress={() => setLabel(lbl)}
                    >
                      <Text style={[styles.pillText, label === lbl && styles.pillTextActive]}>
                        {lbl === 'Home'
                          ? isTamil
                            ? 'வீடு'
                            : 'Home'
                          : lbl === 'Office'
                          ? isTamil
                            ? 'அலுவலகம்'
                            : 'Office'
                          : isTamil
                          ? 'மற்றவை'
                          : 'Other'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Door / Flat & Street */}
                <Text style={styles.inputLabel}>
                  {isTamil ? 'வீட்டு எண் & தெரு (Door/Street) *' : 'Door / Flat No & Street *'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={
                    isTamil
                      ? 'எ.கா: 12/4 கிழக்கு ரத வீதி'
                      : 'e.g. 12/4 East Car Street, Near Temple'
                  }
                  placeholderTextColor="#94A3B8"
                  value={line1}
                  onChangeText={setLine1}
                />

                {/* Landmark / Area */}
                <Text style={styles.inputLabel}>
                  {isTamil ? 'அடையாளம் / பகுதி (Landmark)' : 'Landmark / Area (Optional)'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={
                    isTamil
                      ? 'எ.கா: சிவன் கோவில் எதிரில்'
                      : 'e.g. Opposite Sivan Kovil, Bus Stop'
                  }
                  placeholderTextColor="#94A3B8"
                  value={line2}
                  onChangeText={setLine2}
                />

                {/* City & Pincode Row */}
                <View style={styles.inputRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.inputLabel}>{isTamil ? 'ஊர் (City)' : 'City'}</Text>
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={setCity}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.inputLabel}>
                      {isTamil ? 'அஞ்சல் குறியீடு (Pincode)' : 'Pincode'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={pincode}
                      onChangeText={setPincode}
                      keyboardType="numeric"
                      maxLength={6}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                {/* Set as Default Toggle */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.8}
                  onPress={() => setIsDefault(!isDefault)}
                >
                  <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
                    {isDefault && <Check size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    {isTamil
                      ? 'இந்த முகவரியை முதன்மையாக அமைக்கவும்'
                      : 'Make this my default delivery address'}
                  </Text>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                  style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
                  onPress={handleSaveAddress}
                  disabled={isSubmitting}
                  activeOpacity={0.88}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} color="#FFFFFF" />
                      <Text style={styles.saveBtnText}>
                        {isTamil ? 'முகவரியை சேமிக்க' : 'Save Address'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  defaultAddressCard: {
    borderColor: '#93C5FD',
    backgroundColor: '#F8FAFC',
  },
  selectedAddressCard: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  labelText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  defaultPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  defaultPillText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '600',
  },
  makeDefaultBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  makeDefaultText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 4,
  },
  line1Text: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  line2Text: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 4,
  },
  cityPincodeText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  addNewBtnText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '700',
  },
  formContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cancelFormText: {
    color: '#64748B',
    fontSize: 13,
  },
  inputLabel: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 6,
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  pillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  pillText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#0F172A',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxLabel: {
    color: '#475569',
    fontSize: 13,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 13,
    gap: 8,
    marginTop: 6,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
