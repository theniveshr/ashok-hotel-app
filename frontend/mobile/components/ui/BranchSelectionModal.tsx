import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import {
  MapPin,
  Phone,
  CheckCircle2,
  X,
  Building2,
  Clock,
  ExternalLink,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AppText as Text } from './AppText';
import { useTranslation } from '../../i18n';
import { useBranchStore, type Branch } from '../../store/useBranchStore';
import { useHomeStore } from '../../store/useHomeStore';
import { Palette, Radius, Spacing, FontSize } from '@ashok-raj/ui';

export interface BranchSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BranchSelectionModal({ visible, onClose }: BranchSelectionModalProps) {
  const { isTamil } = useTranslation();
  const { branches, selectedBranch, selectBranch } = useBranchStore();
  const { refreshHomeFeed } = useHomeStore();

  const handleSelect = async (branch: Branch) => {
    Haptics.selectionAsync();
    await selectBranch(branch);
    await refreshHomeFeed(branch.id);
    onClose();
  };

  const openCall = (phone: string) => {
    Haptics.selectionAsync();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleanPhone}`);
  };

  const openMaps = (address: string) => {
    Haptics.selectionAsync();
    const query = encodeURIComponent(`Ashok Raj Lodge & Restaurant, ${address}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://maps.google.com/?q=${query}`,
    });
    Linking.openURL(url);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIcon}>
                <Building2 size={20} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {isTamil ? 'கிளை தேர்வு' : 'Select Branch'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {isTamil
                    ? 'உங்கள் இருப்பிடத்திற்குரிய கிளையைத் தேர்ந்தெடுக்கவும்'
                    : 'Choose your preferred Ashok Raj location'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Branch List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.branchList}
          >
            {branches.map((branch) => {
              const isSelected = selectedBranch?.id === branch.id;
              return (
                <TouchableOpacity
                  key={branch.id}
                  onPress={() => handleSelect(branch)}
                  activeOpacity={0.85}
                  style={[
                    styles.branchItem,
                    isSelected && styles.branchItemSelected,
                  ]}
                >
                  <View style={styles.branchTop}>
                    <View style={styles.branchInfo}>
                      <View style={styles.branchNameRow}>
                        <Text style={styles.branchName}>
                          {isTamil ? branch.nameTa || branch.name : branch.name}
                        </Text>
                        {branch.isMainBranch && (
                          <View style={styles.mainBadge}>
                            <Text style={styles.mainBadgeText}>
                              {isTamil ? 'முதன்மை கிளை' : 'MAIN BRANCH'}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.addressRow}>
                        <MapPin size={14} color="#64748B" style={styles.metaIcon} />
                        <Text style={styles.addressText} numberOfLines={2}>
                          {branch.address}, {branch.city} - {branch.pincode}
                        </Text>
                      </View>

                      <View style={styles.timingRow}>
                        <Clock size={14} color="#16A34A" style={styles.metaIcon} />
                        <Text style={styles.timingText}>
                          {isTamil
                            ? 'உணவகம்: 07:00 AM - 10:30 PM • லாட்ஜ்: 24/7 சேவை'
                            : 'Dining: 07:00 AM - 10:30 PM • Lodge: 24/7 Open'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.selectIndicator}>
                      {isSelected ? (
                        <CheckCircle2 size={24} color="#2563EB" />
                      ) : (
                        <View style={styles.unselectedCircle} />
                      )}
                    </View>
                  </View>

                  {/* Actions for this branch */}
                  <View style={styles.branchActions}>
                    <TouchableOpacity
                      onPress={() => openCall(branch.phone)}
                      style={styles.actionBtn}
                      activeOpacity={0.7}
                    >
                      <Phone size={14} color="#2563EB" />
                      <Text style={styles.actionBtnText}>{branch.phone}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => openMaps(branch.address)}
                      style={styles.actionBtn}
                      activeOpacity={0.7}
                    >
                      <MapPin size={14} color="#2563EB" />
                      <Text style={styles.actionBtnText}>
                        {isTamil ? 'வரைபடம்' : 'Directions'}
                      </Text>
                      <ExternalLink size={12} color="#2563EB" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer Note */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isTamil
                ? 'அனைத்து கிளைகளிலும் தூய்மை, தரம் மற்றும் சிறந்த உபசரிப்பு உறுதி செய்யப்படுகிறது.'
                : 'Experience authentic Chettinad taste & premium lodging at all Ashok Raj properties.'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchList: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  branchItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  branchItemSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FAFF',
  },
  branchTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  branchInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  branchNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  branchName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#0F172A',
  },
  mainBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  mainBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  metaIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  addressText: {
    fontSize: FontSize.xs,
    color: '#64748B',
    lineHeight: 18,
    flex: 1,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timingText: {
    fontSize: FontSize.xs,
    color: '#16A34A',
    fontWeight: '600',
  },
  selectIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: Spacing.xs,
  },
  unselectedCircle: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  branchActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
  },
  actionBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: '#2563EB',
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
});
