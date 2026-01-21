import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import { Text, Surface, IconButton, Button, TextInput, Avatar, Menu, Divider, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Community {
	id: string;
	name: string;
	description: string;
	creator_id: string;
	is_locked: boolean;
	invite_code: string;
	max_members: number;
	created_at: string;
	member_count?: number;
	user_role?: 'creator' | 'admin' | 'member';
}

interface CommunityMember {
	id: string;
	user_id: string;
	role: 'creator' | 'admin' | 'member';
	username?: string;
	email?: string;
}

export default function CommunitiesScreen() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const { user } = useAuth();

	const [communities, setCommunities] = useState<Community[]>([]);
	const [userCommunities, setUserCommunities] = useState<Community[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
	const [showCommunityDetails, setShowCommunityDetails] = useState(false);
	const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
	const [showMenuFor, setShowMenuFor] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [showJoinPrivate, setShowJoinPrivate] = useState(false);
	const [inviteCodeInput, setInviteCodeInput] = useState('');

	// Create form state
	const [newCommunityName, setNewCommunityName] = useState('');
	const [newCommunityDescription, setNewCommunityDescription] = useState('');
	const [isPrivate, setIsPrivate] = useState(false);

	useEffect(() => {
		if (user) {
			loadCommunities();
		}
	}, [user]);

	// Debounced search effect
	useEffect(() => {
		const debounceTimer = setTimeout(() => {
			if (user) {
				loadCommunities();
			}
		}, 300); // 300ms delay

		return () => clearTimeout(debounceTimer);
	}, [searchQuery, user]);

	const loadCommunities = async () => {
		try {
			setLoading(true);

			// Get all communities (both public and private for search)
			let query = supabase
				.from('communities')
				.select('*')
				.order('created_at', { ascending: false });

			// If there's a search query, filter by name or description
			if (searchQuery.trim()) {
				query = query.or(`name.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`);
			} else {
				// If no search, only show unlocked communities
				query = query.eq('is_locked', false);
			}

			const { data: allCommunities, error: allError } = await query;
			const communitiesData = allCommunities as any[];

			if (allError) throw allError;

			// Get member counts for each community
			const communitiesWithCounts = await Promise.all(
				(communitiesData || []).map(async (community: any) => {
					const { count } = await supabase
						.from('community_members')
						.select('*', { count: 'exact', head: true })
						.eq('community_id', community.id);

					return {
						...community,
						member_count: count || 0
					};
				})
			);

			// Get user's communities with their roles
			const { data: userCommunityData, error: userError } = await supabase
				.from('community_members')
				.select(`
					role,
					communities (
						id,
						name,
						description,
						creator_id,
						is_locked,
						invite_code,
						max_members,
						created_at
					)
				`)
				.eq('user_id', user!.id);

			if (userError) throw userError;

			// Get member counts for user communities
			const userCommunitiesWithCounts = await Promise.all(
				((userCommunityData as any[]) || []).map(async (item) => {
					const { count } = await supabase
						.from('community_members')
						.select('*', { count: 'exact', head: true })
						.eq('community_id', item.communities.id);

					return {
						id: item.communities.id,
						name: item.communities.name,
						description: item.communities.description,
						creator_id: item.communities.creator_id,
						is_locked: item.communities.is_locked,
						invite_code: item.communities.invite_code,
						max_members: item.communities.max_members,
						created_at: item.communities.created_at,
						user_role: item.role,
						member_count: count || 0
					};
				})
			);

			setCommunities(communitiesWithCounts);
			setUserCommunities(userCommunitiesWithCounts as Community[]);

		} catch (error) {
			console.error('Error loading communities:', error);
			Alert.alert('Error', 'Failed to load communities');
		} finally {
			setLoading(false);
		}
	};

	const createCommunity = async () => {
		if (!user || !newCommunityName.trim()) {
			Alert.alert('Error', 'Please enter a community name');
			return;
		}

		try {
			// Generate invite code
			const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

			const { data, error } = await supabase
				.from('communities')
				.insert({
					name: newCommunityName.trim(),
					description: newCommunityDescription.trim(),
					creator_id: user.id,
					is_locked: isPrivate,
					invite_code: inviteCode,
				})
				.select()
				.single();

			if (error) throw error;

			// Add creator as member with creator role
			await supabase
				.from('community_members')
				.insert({
					community_id: data.id,
					user_id: user.id,
					role: 'creator'
				});

			Alert.alert('Success', 'Community created successfully!');
			setShowCreateForm(false);
			setNewCommunityName('');
			setNewCommunityDescription('');
			setIsPrivate(false);
			loadCommunities();

		} catch (error) {
			console.error('Error creating community:', error);
			Alert.alert('Error', 'Failed to create community');
		}
	};

	const joinCommunity = async (communityId: string) => {
		if (!user) return;

		try {
			const { error } = await supabase
				.from('community_members')
				.insert({
					community_id: communityId,
					user_id: user.id,
					role: 'member'
				});

			if (error) throw error;

			Alert.alert('Success', 'Joined community!');
			loadCommunities();

		} catch (error) {
			console.error('Error joining community:', error);
			Alert.alert('Error', 'Failed to join community');
		}
	};

	const leaveCommunity = async (communityId: string) => {
		if (!user) return;

		Alert.alert(
			'Leave Community',
			'Are you sure you want to leave this community?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Leave',
					style: 'destructive',
					onPress: async () => {
						try {
							const { error } = await supabase
								.from('community_members')
								.delete()
								.eq('community_id', communityId)
								.eq('user_id', user.id);

							if (error) throw error;

							loadCommunities();
							if (selectedCommunity?.id === communityId) {
								setShowCommunityDetails(false);
								setSelectedCommunity(null);
							}
						} catch (error) {
							console.error('Error leaving community:', error);
							Alert.alert('Error', 'Failed to leave community');
						}
					}
				}
			]
		);
	};

	const shareInviteLink = async (inviteCode: string) => {
		try {
			const inviteUrl = `ai-battlefield://join-community/${inviteCode}`;
			await Share.share({
				message: `Join my community on AI Battlefield! Use code: ${inviteCode}`,
				url: inviteUrl,
			});
		} catch (error) {
			console.error('Error sharing invite:', error);
		}
	};

	const joinPrivateCommunity = async () => {
		if (!user || !inviteCodeInput.trim()) {
			Alert.alert('Error', 'Please enter an invite code');
			return;
		}

		try {
			const success = await joinCommunityByCode(inviteCodeInput.trim().toUpperCase());
			if (success) {
				Alert.alert('Success', 'Joined community successfully!');
				setInviteCodeInput('');
				setShowJoinPrivate(false);
				loadCommunities();
			} else {
				Alert.alert('Error', 'Invalid or expired invite code');
			}
		} catch (error) {
			console.error('Error joining private community:', error);
			Alert.alert('Error', 'Failed to join community');
		}
	};

	const joinCommunityByCode = async (code: string): Promise<boolean> => {
		if (!user) return false;

		// First, find the community by invite code
		const { data: invite, error: inviteError } = await supabase
			.from('community_invites')
			.select('community_id')
			.eq('invite_code', code)
			.gt('expires_at', new Date().toISOString())
			.single();

		if (inviteError || !invite) {
			return false;
		}

		// Check if user is already a member
		const { data: existingMember } = await supabase
			.from('community_members')
			.select('id')
			.eq('community_id', invite.community_id)
			.eq('user_id', user.id)
			.single();

		if (existingMember) {
			return false; // Already a member
		}

		// Join the community
		const { error: joinError } = await supabase
			.from('community_members')
			.insert({
				community_id: invite.community_id,
				user_id: user.id,
				role: 'member'
			});

		if (joinError) {
			console.error('Error joining community:', joinError);
			return false;
		}

		return true;
	};

	const toggleCommunityLock = async (communityId: string, isLocked: boolean) => {
		try {
			const { error } = await supabase
				.from('communities')
				.update({ is_locked: !isLocked })
				.eq('id', communityId);

			if (error) throw error;

			loadCommunities();
			if (selectedCommunity?.id === communityId) {
				setSelectedCommunity({ ...selectedCommunity, is_locked: !isLocked });
			}
		} catch (error) {
			console.error('Error toggling lock:', error);
			Alert.alert('Error', 'Failed to update community');
		}
	};

	const loadCommunityMembers = async (communityId: string) => {
		try {
			const { data, error } = await supabase
				.from('community_members')
				.select(`
					id,
					user_id,
					role,
					profiles!inner(username, full_name)
				`)
				.eq('community_id', communityId);

			if (error) throw error;

			const membersWithNames = data?.map((member: any) => ({
				id: member.id,
				user_id: member.user_id,
				role: member.role,
				username: member.profiles?.username,
				email: member.profiles?.full_name || 'Unknown User'
			})) || [];

			setCommunityMembers(membersWithNames);
		} catch (error) {
			console.error('Error loading members:', error);
		}
	};

	const openCommunityDetails = async (community: Community) => {
		setSelectedCommunity(community);
		await loadCommunityMembers(community.id);
		setShowCommunityDetails(true);
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.centered]}>
				<LinearGradient colors={['#0f0c29', '#1a1a2e', '#16213e']} style={styles.background}>
					<Text style={styles.loadingText}>Loading Communities...</Text>
				</LinearGradient>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#0f0c29', '#1a1a2e', '#16213e']}
				style={styles.background}
			>
				{/* Header */}
				<View style={[styles.header, { paddingTop: insets.top + 10 }]}>
					<IconButton icon="arrow-left" iconColor="#fff" onPress={() => navigation.goBack()} />
					<Text style={styles.headerTitle}>COMMUNITIES</Text>
					<View style={{ width: 40 }} />
				</View>

				<ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}>

					{/* Search Section */}
					<View style={styles.topSearchSection}>
						<TextInput
							label="Search Communities"
							value={searchQuery}
							onChangeText={setSearchQuery}
							mode="outlined"
							style={styles.topSearchInput}
							placeholder="Search by name or description..."
							right={<TextInput.Icon icon="magnify" />}
						/>
					</View>

					{/* Create Community Section */}
					<View style={styles.createSection}>
						<Button
							mode="outlined"
							onPress={() => setShowCreateForm(!showCreateForm)}
							style={styles.createToggleButton}
							labelStyle={styles.createToggleLabel}
							icon={showCreateForm ? "chevron-up" : "plus"}
						>
							{showCreateForm ? 'CANCEL' : 'CREATE COMMUNITY'}
						</Button>

						{showCreateForm && (
							<Surface style={styles.createForm} elevation={4}>
								<Text style={styles.formTitle}>Create New Community</Text>

								<TextInput
									label="Community Name"
									value={newCommunityName}
									onChangeText={setNewCommunityName}
									mode="outlined"
									style={styles.input}
									maxLength={50}
								/>

								<TextInput
									label="Description (Optional)"
									value={newCommunityDescription}
									onChangeText={setNewCommunityDescription}
									mode="outlined"
									style={styles.input}
									multiline
									numberOfLines={3}
									maxLength={200}
								/>

								<View style={styles.privacySection}>
									<Text style={styles.privacyLabel}>Privacy Settings</Text>
									<View style={styles.privacyOptions}>
										<Button
											mode={!isPrivate ? "contained" : "outlined"}
											onPress={() => setIsPrivate(false)}
											style={styles.privacyButton}
										>
											Public
										</Button>
										<Button
											mode={isPrivate ? "contained" : "outlined"}
											onPress={() => setIsPrivate(true)}
											style={styles.privacyButton}
										>
											Private
										</Button>
									</View>
									<Text style={styles.privacyNote}>
										{isPrivate
											? 'Private communities require invite codes to join'
											: 'Public communities can be joined by anyone'
										}
									</Text>
								</View>

								<Button
									mode="contained"
									onPress={createCommunity}
									style={styles.createButton}
									disabled={!newCommunityName.trim()}
								>
									CREATE COMMUNITY
								</Button>
							</Surface>
						)}
					</View>

					{/* Join Private Community */}
					<View style={styles.joinPrivateInline}>
						<Button
							mode="outlined"
							onPress={() => setShowJoinPrivate(true)}
							style={styles.joinPrivateInlineButton}
							icon="account-plus"
						>
							Join Private Community
						</Button>
					</View>

					{/* User's Communities */}
					{userCommunities.length > 0 && (
						<>
							<Text style={styles.sectionTitle}>My Communities</Text>
							{userCommunities.map((community) => (
								<Surface key={community.id} style={styles.communityCard} elevation={2}>
									<View style={styles.communityHeader}>
										<View style={styles.communityInfo}>
											<Text style={styles.communityName}>{community.name}</Text>
											<Text style={styles.communityDesc}>
												{community.description || 'No description'}
											</Text>
											<View style={styles.communityMeta}>
												<Chip icon="account-group" style={styles.metaChip}>
													{community.member_count || 0} members
												</Chip>
												<Chip
													icon={community.is_locked ? "lock" : "lock-open"}
													style={[styles.metaChip, community.is_locked && styles.lockedChip]}
												>
													{community.is_locked ? 'Locked' : 'Open'}
												</Chip>
												<Chip
													icon="crown"
													style={[styles.metaChip, styles.roleChip]}
												>
													{community.user_role}
												</Chip>
											</View>
										</View>
										<Menu
											visible={showMenuFor === community.id}
											onDismiss={() => setShowMenuFor(null)}
											anchor={
												<IconButton
													icon="dots-vertical"
													onPress={() => setShowMenuFor(community.id)}
												/>
											}
										>
											<Menu.Item
												onPress={() => shareInviteLink(community.invite_code)}
												title="Share Invite"
												leadingIcon="share-variant"
											/>
											{(community.user_role === 'creator' || community.user_role === 'admin') && (
												<Menu.Item
													onPress={() => toggleCommunityLock(community.id, community.is_locked)}
													title={community.is_locked ? "Unlock Community" : "Lock Community"}
													leadingIcon={community.is_locked ? "lock-open" : "lock"}
												/>
											)}
											<Menu.Item
												onPress={() => leaveCommunity(community.id)}
												title="Leave Community"
												leadingIcon="exit-to-app"
												titleStyle={{ color: '#F44336' }}
											/>
										</Menu>
									</View>
								</Surface>
							))}
						</>
					)}

					{/* Available Communities */}
					<Text style={styles.sectionTitle}>Available Communities</Text>
					{communities.length > 0 ? (
						communities.map((community) => {
							const isMember = userCommunities.some(uc => uc.id === community.id);
							return (
								<Surface key={community.id} style={styles.communityCard} elevation={2}>
									<View style={styles.communityHeader}>
										<View style={styles.communityInfo}>
											<Text style={styles.communityName}>{community.name}</Text>
											<Text style={styles.communityDesc}>
												{community.description || 'No description'}
											</Text>
											<View style={styles.communityMeta}>
												<Chip icon="account-group" style={styles.metaChip}>
													{community.member_count || 0} members
												</Chip>
												{community.is_locked && (
													<Chip icon="lock" style={[styles.metaChip, styles.lockedChip]}>
														Private
													</Chip>
												)}
											</View>
										</View>
										{!isMember && !community.is_locked && (
											<Button
												mode="outlined"
												onPress={() => joinCommunity(community.id)}
												style={styles.joinButton}
											>
												Join
											</Button>
										)}
									</View>
								</Surface>
							);
						})
					) : (
						<Surface style={styles.emptyCard} elevation={1}>
							<Text style={styles.emptyText}>No communities available</Text>
							<Text style={styles.emptySubtext}>Create the first community!</Text>
						</Surface>
					)}

				</ScrollView>

			</LinearGradient>

			{/* Empty Bottom Navigation Bar */}
			<View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 15) }]} />

			{/* Join Private Community Modal */}
			{showJoinPrivate && (
				<Surface style={styles.modalOverlay} elevation={5}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Join Private Community</Text>
						<TextInput
							label="Invite Code"
							value={inviteCodeInput}
							onChangeText={setInviteCodeInput}
							mode="outlined"
							style={styles.modalInput}
							placeholder="Enter invite code..."
							autoCapitalize="characters"
							maxLength={20}
						/>
						<View style={styles.modalButtons}>
							<Button onPress={() => setShowJoinPrivate(false)}>Cancel</Button>
							<Button mode="contained" onPress={joinPrivateCommunity}>
								Join Community
							</Button>
						</View>
					</View>
				</Surface>
			)}

			{/* Community Details Modal */}
			{showCommunityDetails && selectedCommunity && (
				<Surface style={styles.modalOverlay} elevation={5}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>{selectedCommunity.name}</Text>
						<Text style={styles.modalDescription}>
							{selectedCommunity.description || 'No description'}
						</Text>
						<Text style={styles.modalInfo}>
							Members: {selectedCommunity.member_count}
						</Text>
						<Text style={styles.modalInfo}>
							Status: {selectedCommunity.is_locked ? 'Private' : 'Public'}
						</Text>
						{communityMembers.length > 0 && (
							<View style={styles.membersList}>
								<Text style={styles.membersTitle}>Members:</Text>
								{communityMembers.slice(0, 5).map((member) => (
									<Text key={member.id} style={styles.memberItem}>
										{member.username || member.email} ({member.role})
									</Text>
								))}
								{communityMembers.length > 5 && (
									<Text style={styles.moreMembers}>
										...and {communityMembers.length - 5} more
									</Text>
								)}
							</View>
						)}
						<View style={styles.modalButtons}>
							<Button onPress={() => setShowCommunityDetails(false)}>Close</Button>
						</View>
					</View>
				</Surface>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	background: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 10,
		paddingBottom: 10,
		backgroundColor: 'rgba(22, 33, 62, 0.8)',
	},
	headerTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		letterSpacing: 2,
	},
	scrollContent: {
		padding: 20,
	},
	topSearchSection: {
		marginBottom: 20,
	},
	topSearchInput: {
		backgroundColor: '#2c2c2c',
	},
	createSection: {
		marginBottom: 20,
	},
	joinPrivateInline: {
		marginBottom: 30,
	},
	joinPrivateInlineButton: {
		borderColor: '#BB86FC',
	},
	createToggleButton: {
		borderColor: '#BB86FC',
		borderWidth: 2,
		borderRadius: 8,
		marginBottom: 15,
	},
	createToggleLabel: {
		color: '#BB86FC',
		fontWeight: 'bold',
		letterSpacing: 1,
	},
	createForm: {
		backgroundColor: '#1e1e2e',
		borderRadius: 16,
		padding: 20,
		borderWidth: 1,
		borderColor: '#333',
	},
	formTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
	},
	input: {
		backgroundColor: '#2c2c2c',
		marginBottom: 15,
	},
	privacySection: {
		marginBottom: 20,
	},
	privacyLabel: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 10,
	},
	privacyOptions: {
		flexDirection: 'row',
		gap: 10,
		marginBottom: 10,
	},
	privacyButton: {
		flex: 1,
	},
	privacyNote: {
		color: '#888',
		fontSize: 12,
		fontStyle: 'italic',
	},
	createButton: {
		backgroundColor: '#BB86FC',
		borderRadius: 8,
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15,
		marginLeft: 5,
	},
	communityCard: {
		backgroundColor: '#1e1e2e',
		borderRadius: 12,
		padding: 15,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#333',
	},
	communityHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	communityInfo: {
		flex: 1,
	},
	communityName: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	communityDesc: {
		color: '#ccc',
		fontSize: 14,
		marginBottom: 8,
		lineHeight: 20,
	},
	communityMeta: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 6,
	},
	metaChip: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
	lockedChip: {
		backgroundColor: 'rgba(244, 67, 54, 0.2)',
	},
	roleChip: {
		backgroundColor: 'rgba(255, 193, 7, 0.2)',
	},
	joinButton: {
		borderColor: '#BB86FC',
		marginTop: 8,
	},
	emptyCard: {
		backgroundColor: '#1e1e2e',
		borderRadius: 12,
		padding: 40,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#333',
		alignItems: 'center',
	},
	emptyText: {
		color: '#888',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 5,
	},
	emptySubtext: {
		color: '#666',
		fontSize: 14,
	},
	modalOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	modalContent: {
		backgroundColor: '#1e1e2e',
		borderRadius: 16,
		padding: 20,
		width: '100%',
		maxWidth: 400,
		borderWidth: 1,
		borderColor: '#333',
	},
	modalTitle: {
		color: '#fff',
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 15,
		textAlign: 'center',
	},
	modalDescription: {
		color: '#ccc',
		fontSize: 14,
		marginBottom: 15,
		lineHeight: 20,
	},
	modalInfo: {
		color: '#888',
		fontSize: 14,
		marginBottom: 8,
	},
	modalInput: {
		backgroundColor: '#2c2c2c',
		marginBottom: 20,
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
	membersList: {
		marginTop: 15,
		paddingTop: 15,
		borderTopWidth: 1,
		borderTopColor: '#333',
	},
	membersTitle: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	memberItem: {
		color: '#ccc',
		fontSize: 14,
		marginBottom: 5,
	},
	moreMembers: {
		color: '#888',
		fontSize: 12,
		fontStyle: 'italic',
		marginTop: 5,
	},
	centered: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		color: '#BB86FC',
		fontSize: 16,
		marginTop: 10,
	},
	bottomNav: {
		backgroundColor: '#161625',
		borderTopWidth: 1,
		borderTopColor: '#222',
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: 70,
	},
});
