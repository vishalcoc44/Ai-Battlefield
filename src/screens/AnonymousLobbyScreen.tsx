import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Surface, IconButton, Button, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MASKS = [
	{ id: '1', name: 'Neon Fox', icon: 'https://i.pravatar.cc/150?img=50', color: '#FF5252' },
	{ id: '2', name: 'Cyber Monk', icon: 'https://i.pravatar.cc/150?img=51', color: '#4CAF50' },
	{ id: '3', name: 'Void Walker', icon: 'https://i.pravatar.cc/150?img=52', color: '#BB86FC' },
	{ id: '4', name: 'Data Ghost', icon: 'https://i.pravatar.cc/150?img=53', color: '#2196F3' },
];

const TOPICS = [
	{ id: '1', title: 'Is Privacy Dead?', active: 124, color: '#666' },
	{ id: '2', title: 'Crypto Regulation', active: 89, color: '#666' },
	{ id: '3', title: 'Genetic Editing', active: 56, color: '#666' },
];

export default function AnonymousLobbyScreen() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const [selectedMask, setSelectedMask] = useState(MASKS[0]);

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#000000', '#1a1a1a', '#0f0f0f']}
				style={styles.background}
			>
				{/* Header */}
				<View style={[styles.header, { paddingTop: insets.top + 10 }]}>
					<IconButton icon="arrow-left" iconColor="#fff" onPress={() => navigation.goBack()} />
					<Text style={styles.headerTitle}>THE VOID</Text>
					<IconButton icon="incognito" iconColor="#fff" onPress={() => { }} />
				</View>

				<ScrollView contentContainerStyle={styles.scrollContent}>

					<Text style={styles.subtitle}>Choose Your Mask</Text>
					<Text style={styles.description}>
						In The Void, your identity is hidden. Debate freely, but stay civil.
					</Text>

					{/* Mask Selection */}
					<View style={styles.maskGrid}>
						{MASKS.map((mask) => (
							<TouchableOpacity
								key={mask.id}
								style={[
									styles.maskItem,
									selectedMask.id === mask.id && { borderColor: mask.color, borderWidth: 2 }
								]}
								onPress={() => setSelectedMask(mask)}
							>
								<Avatar.Image size={60} source={{ uri: mask.icon }} style={styles.maskAvatar} />
								<Text style={[styles.maskName, selectedMask.id === mask.id && { color: mask.color }]}>
									{mask.name}
								</Text>
							</TouchableOpacity>
						))}
					</View>

					<Button
						mode="contained"
						onPress={() => { }}
						style={[styles.enterButton, { backgroundColor: selectedMask.color }]}
						labelStyle={styles.buttonLabel}
						icon="door-open"
					>
						ENTER AS {selectedMask.name.toUpperCase()}
					</Button>

					<Text style={styles.sectionTitle}>Active Void Channels</Text>

					{TOPICS.map((topic) => (
						<Surface key={topic.id} style={styles.topicCard} elevation={2}>
							<View style={styles.topicLeft}>
								<MaterialCommunityIcons name="pound" size={20} color="#666" />
								<Text style={styles.topicTitle}>{topic.title}</Text>
							</View>
							<View style={styles.topicRight}>
								<Text style={styles.activeCount}>{topic.active}</Text>
								<MaterialCommunityIcons name="account-group" size={16} color="#666" />
							</View>
						</Surface>
					))}

				</ScrollView>
			</LinearGradient>
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
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
	},
	headerTitle: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		letterSpacing: 4,
		fontFamily: 'monospace',
	},
	scrollContent: {
		padding: 20,
		paddingBottom: 50,
	},
	subtitle: {
		color: '#fff',
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 10,
		textAlign: 'center',
	},
	description: {
		color: '#888',
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 30,
		paddingHorizontal: 20,
	},
	maskGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
		marginBottom: 30,
	},
	maskItem: {
		alignItems: 'center',
		marginBottom: 20,
		padding: 10,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'transparent',
	},
	maskAvatar: {
		marginBottom: 10,
		backgroundColor: '#333',
	},
	maskName: {
		color: '#888',
		fontSize: 12,
		fontWeight: 'bold',
	},
	enterButton: {
		borderRadius: 8,
		marginBottom: 40,
		paddingVertical: 6,
	},
	buttonLabel: {
		fontSize: 16,
		fontWeight: 'bold',
		letterSpacing: 1,
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 15,
		marginLeft: 5,
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	topicCard: {
		backgroundColor: '#111',
		borderRadius: 8,
		padding: 20,
		marginBottom: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#222',
	},
	topicLeft: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	topicTitle: {
		color: '#ccc',
		fontSize: 16,
		marginLeft: 10,
	},
	topicRight: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	activeCount: {
		color: '#666',
		marginRight: 6,
		fontSize: 12,
	},
});
