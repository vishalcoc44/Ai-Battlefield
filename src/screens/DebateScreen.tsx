import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, IconButton, Surface, Avatar, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const DebateScreen = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const insets = useSafeAreaInsets();
	const [inputText, setInputText] = useState('');

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerTop}>
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<IconButton icon="arrow-left" iconColor="#fff" size={24} />
					</TouchableOpacity>
					<View style={styles.headerTitleContainer}>
						<Text style={styles.headerTitle}>DEBATE</Text>
						<View style={styles.strengthBadge}>
							<Text style={styles.strengthText}>Strength: 85</Text>
						</View>
					</View>
					<IconButton icon="dots-vertical" iconColor="#fff" size={24} />
				</View>

				<View style={styles.healthBarContainer}>
					<View style={[styles.healthBar, { flex: 1, backgroundColor: '#BB86FC' }]} />
					<View style={styles.vsIconContainer}>
						<Text style={styles.vsText}>VS</Text>
					</View>
					<View style={[styles.healthBar, { flex: 1, backgroundColor: '#CF6679' }]} />
				</View>
			</View>

			<View style={styles.chatContainer}>
				<ScrollView contentContainerStyle={styles.chatContent}>
					<View style={[styles.messageRow, styles.aiRow]}>
						<View style={[styles.avatar, { width: 32, height: 32, borderRadius: 16 }]} />
						<View style={[styles.messageBubble, styles.aiBubble]}>
							<Text style={styles.senderName}>AI OPPONENT</Text>
							<Text style={styles.messageText}>I believe that artificial intelligence will eventually surpass human intelligence in all cognitive tasks.</Text>
						</View>
					</View>
				</ScrollView>
			</View>

			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
				<View style={styles.inputContainer}>
					<View style={styles.inputWrapper}>
						<TextInput
							style={styles.input}
							placeholder="Type your argument..."
							placeholderTextColor="#888"
							value={inputText}
							onChangeText={setInputText}
							underlineColor="transparent"
							activeUnderlineColor="transparent"
							textColor="#fff"
						/>
						<TouchableOpacity style={styles.sendButton}>
							<LinearGradient colors={['#BB86FC', '#3700B3']} style={styles.sendGradient}>
								<IconButton icon="send" iconColor="#fff" size={20} />
							</LinearGradient>
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</View>
	);
};

export default DebateScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#121212',
	},
	header: {
		backgroundColor: '#1e1e2e',
		paddingTop: 50,
		paddingBottom: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#333',
	},
	headerTop: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 10,
	},
	headerTitleContainer: {
		alignItems: 'center',
	},
	headerTitle: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
		letterSpacing: 1,
	},
	strengthBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 215, 0, 0.1)',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 10,
		marginTop: 4,
	},
	strengthText: {
		color: '#FFD700',
		fontSize: 10,
		fontWeight: 'bold',
		marginLeft: 4,
	},
	healthBarContainer: {
		flexDirection: 'row',
		height: 4,
		marginTop: 15,
		marginHorizontal: 20,
		alignItems: 'center',
	},
	healthBar: {
		height: '100%',
		borderRadius: 2,
	},
	vsIconContainer: {
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: '#333',
		justifyContent: 'center',
		alignItems: 'center',
		marginHorizontal: -10,
		zIndex: 1,
		borderWidth: 2,
		borderColor: '#1e1e2e',
	},
	vsText: {
		color: '#fff',
		fontSize: 8,
		fontWeight: 'bold',
	},
	chatContainer: {
		flex: 1,
	},
	chatContent: {
		padding: 16,
		paddingBottom: 20,
	},
	messageRow: {
		flexDirection: 'row',
		marginBottom: 20,
		maxWidth: '85%',
	},
	userRow: {
		alignSelf: 'flex-end',
		flexDirection: 'row-reverse',
	},
	aiRow: {
		alignSelf: 'flex-start',
	},
	avatar: {
		marginRight: 10,
		backgroundColor: '#333',
	},
	messageBubble: {
		padding: 15,
		borderRadius: 20,
		minWidth: 120,
	},
	userBubble: {
		backgroundColor: 'rgba(187, 134, 252, 0.15)',
		borderTopRightRadius: 4,
		borderWidth: 1,
		borderColor: 'rgba(187, 134, 252, 0.3)',
	},
	aiBubble: {
		backgroundColor: '#2a2a3a',
		borderTopLeftRadius: 4,
		borderWidth: 1,
		borderColor: '#333',
	},
	senderName: {
		color: '#aaa',
		fontSize: 10,
		fontWeight: 'bold',
		marginBottom: 4,
		letterSpacing: 1,
	},
	messageText: {
		color: '#fff',
		fontSize: 15,
		lineHeight: 22,
	},
	factCheckContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: 'rgba(255, 255, 255, 0.1)',
	},
	factCheckText: {
		color: '#FF5252',
		fontSize: 11,
		marginLeft: 4,
		fontStyle: 'italic',
	},
	loadingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 50,
		marginBottom: 20,
	},
	loadingText: {
		color: '#888',
		fontSize: 12,
		marginLeft: 10,
		fontStyle: 'italic',
	},
	inputContainer: {
		backgroundColor: '#1e1e2e',
		padding: 15,
		paddingBottom: 30, // Safe area
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#2a2a3a',
		borderRadius: 25,
		paddingRight: 5,
		borderWidth: 1,
		borderColor: '#333',
	},
	input: {
		flex: 1,
		backgroundColor: 'transparent',
		height: 50,
		fontSize: 16,
	},
	sendButton: {
		marginRight: 5,
	},
	sendGradient: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
