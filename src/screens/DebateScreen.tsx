import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, TextInput, IconButton, Surface, Avatar, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import {
	createDebate,
	getDebate,
	getDebateMessages,
	saveDebateMessage,
	generateAIDebateResponse,
	factCheckClaim,
	updateDebateSteelManLevel,
	endDebate,
	DebateMessage
} from '../services/debateService';
import { supabase } from '../lib/supabase';

const DebateScreen = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const insets = useSafeAreaInsets();
	const { user } = useAuth();
	const [inputText, setInputText] = useState('');
	const [messages, setMessages] = useState<DebateMessage[]>([]);
	const [debate, setDebate] = useState<any>(null);
	const [persona, setPersona] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [steelManLevel, setSteelManLevel] = useState(0.5);
	const scrollViewRef = useRef<ScrollView>(null);

	useEffect(() => {
		initializeDebate();
	}, []);

	const initializeDebate = async () => {
		if (!user) return;

		try {
			setLoading(true);
			const params = route.params as any;
			const { personaId, topic } = params || {};

			if (!personaId || !topic) {
				Alert.alert('Error', 'Missing debate parameters');
				navigation.goBack();
				return;
			}

			// Fetch persona details
			const { data: personaData } = await supabase
				.from('personas')
				.select('*')
				.eq('id', personaId)
				.single();

			if (!personaData) {
				Alert.alert('Error', 'Persona not found');
				navigation.goBack();
				return;
			}

			setPersona(personaData);

			// Create or get existing debate
			const debateData = await createDebate(user.id, personaId, topic);
			if (!debateData) {
				Alert.alert('Error', 'Failed to create debate');
				navigation.goBack();
				return;
			}

			setDebate(debateData);
			setSteelManLevel(debateData.steel_man_level);

			// Fetch existing messages
			const existingMessages = await getDebateMessages(debateData.id);
			setMessages(existingMessages);

		} catch (error) {
			console.error('Error initializing debate:', error);
			Alert.alert('Error', 'Failed to initialize debate');
		} finally {
			setLoading(false);
		}
	};

	const handleSendMessage = async () => {
		if (!inputText.trim() || !debate || sending) return;

		try {
			setSending(true);

			// Save user message
			const userMessage = await saveDebateMessage(debate.id, 'user', inputText.trim());
			if (userMessage) {
				setMessages(prev => [...prev, userMessage]);
			}

			// Fact-check the user's claim
			const factCheckResult = await factCheckClaim(inputText.trim());

			// Update user's message with fact-check result
			if (userMessage && factCheckResult) {
				await supabase
					.from('debate_messages')
					.update({ fact_check_result: factCheckResult })
					.eq('id', userMessage.id);

				// Update local message
				setMessages(prev => prev.map(msg =>
					msg.id === userMessage.id
						? { ...msg, fact_check_result: factCheckResult }
						: msg
				));
			}

			// Generate AI response
			const aiResponse = await generateAIDebateResponse(
				inputText.trim(),
				debate.topic,
				steelManLevel,
				persona.description || persona.name
			);

			// Save AI message
			const aiMessage = await saveDebateMessage(debate.id, 'ai', aiResponse);
			if (aiMessage) {
				setMessages(prev => [...prev, aiMessage]);
			}

			// Adjust steel-man level based on debate quality
			const newSteelManLevel = Math.min(1, Math.max(0, steelManLevel + 0.1));
			setSteelManLevel(newSteelManLevel);
			await updateDebateSteelManLevel(debate.id, newSteelManLevel);

			setInputText('');

			// Scroll to bottom
			setTimeout(() => {
				scrollViewRef.current?.scrollToEnd({ animated: true });
			}, 100);

		} catch (error) {
			console.error('Error sending message:', error);
			Alert.alert('Error', 'Failed to send message');
		} finally {
			setSending(false);
		}
	};

	const handleEndDebate = async () => {
		if (!debate) return;

		Alert.alert(
			'End Debate',
			'Are you sure you want to end this debate?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'End Debate',
					onPress: async () => {
						await endDebate(debate.id);
						navigation.goBack();
					}
				}
			]
		);
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#BB86FC" />
				<Text style={styles.loadingText}>Initializing debate...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerTop}>
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<IconButton icon="arrow-left" iconColor="#fff" size={24} />
					</TouchableOpacity>
					<View style={styles.headerTitleContainer}>
						<Text style={styles.headerTitle}>{debate?.topic || 'DEBATE'}</Text>
						<View style={styles.strengthBadge}>
							<Text style={styles.strengthText}>Steel-man: {Math.round(steelManLevel * 100)}%</Text>
						</View>
					</View>
					<IconButton icon="stop-circle" iconColor="#fff" size={24} onPress={handleEndDebate} />
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
				<ScrollView
					ref={scrollViewRef}
					contentContainerStyle={styles.chatContent}
				>
					{messages.length === 0 ? (
						<View style={styles.emptyState}>
							<Text style={styles.emptyStateText}>Start the debate by sending your first argument!</Text>
						</View>
					) : (
						messages.map((message) => (
							<View
								key={message.id}
								style={[
									styles.messageRow,
									message.sender_type === 'user' ? styles.userRow : styles.aiRow
								]}
							>
								{message.sender_type === 'ai' && (
									<Avatar.Image
										size={32}
										source={{ uri: persona?.avatar_url || 'https://i.pravatar.cc/150?img=60' }}
										style={styles.avatar}
									/>
								)}
								<View style={[
									styles.messageBubble,
									message.sender_type === 'user' ? styles.userBubble : styles.aiBubble
								]}>
									<Text style={styles.senderName}>
										{message.sender_type === 'user' ? 'YOU' : persona?.name?.toUpperCase() || 'AI OPPONENT'}
									</Text>
									<Text style={styles.messageText}>{message.content}</Text>

									{/* Fact-check result for user messages */}
									{message.sender_type === 'user' && message.fact_check_result && (
										<View style={styles.factCheckContainer}>
											<IconButton
												icon={message.fact_check_result.verified ? "check-circle" : "alert-circle"}
												size={16}
												iconColor={message.fact_check_result.verified ? "#4CAF50" : "#FF5252"}
											/>
											<Text style={[
												styles.factCheckText,
												{ color: message.fact_check_result.verified ? "#4CAF50" : "#FF5252" }
											]}>
												{message.fact_check_result.verified ? "Fact-checked ✓" : "Needs verification"}
											</Text>
										</View>
									)}
								</View>
								{message.sender_type === 'user' && (
									<Avatar.Image
										size={32}
										source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?img=1' }}
										style={styles.avatar}
									/>
								)}
							</View>
						))
					)}

					{sending && (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="small" color="#BB86FC" />
							<Text style={styles.loadingText}>AI is thinking...</Text>
						</View>
					)}
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
						<TouchableOpacity
							style={styles.sendButton}
							onPress={handleSendMessage}
							disabled={sending || !inputText.trim()}
						>
							<LinearGradient
								colors={sending || !inputText.trim() ? ['#666', '#444'] : ['#BB86FC', '#3700B3']}
								style={styles.sendGradient}
							>
								<IconButton
									icon="send"
									iconColor="#fff"
									size={20}
									disabled={sending || !inputText.trim()}
								/>
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
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 40,
	},
	emptyStateText: {
		color: '#666',
		fontSize: 16,
		textAlign: 'center',
		fontStyle: 'italic',
	},
});
