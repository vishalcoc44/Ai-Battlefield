import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, TextInput, IconButton, Surface, Avatar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
	getGroupDebateMessages,
	sendGroupDebateMessage,
	joinGroupDebate,
	leaveGroupDebate,
	subscribeToGroupDebateMessages,
	updateGroupDebate,
	type GroupDebateMessage,
	type GroupDebate
} from '../services/groupDebateService';

export default function GroupDebateScreen() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const route = useRoute<any>();
	const { session } = useAuth();
	const { debateId } = route.params || {};

	const [messages, setMessages] = useState<GroupDebateMessage[]>([]);
	const [inputText, setInputText] = useState('');
	const [loading, setLoading] = useState(true);
	const [participantCount, setParticipantCount] = useState(0);
	const [debate, setDebate] = useState<GroupDebate | null>(null);
	const [editingTopic, setEditingTopic] = useState(false);
	const [newTopic, setNewTopic] = useState('');
	const scrollViewRef = useRef<ScrollView>(null);

	useEffect(() => {
		if (!debateId || !session?.user?.id) return;

		loadDebate();
		loadMessages();
		joinDebate();

		// Subscribe to real-time messages
		const subscription = subscribeToGroupDebateMessages(debateId, (newMessage) => {
			setMessages((prev) => [...prev, newMessage]);
		});

		return () => {
			subscription.unsubscribe();
			leaveDebate();
		};
	}, [debateId, session]);

	const loadDebate = async () => {
		const { data, error } = await supabase
			.from('group_debates')
			.select('*')
			.eq('id', debateId)
			.single();

		if (error) {
			console.error('Error loading debate:', error);
			return;
		}

		setDebate(data);
		setNewTopic(data.topic);
	};

	const loadMessages = async () => {
		setLoading(true);
		const msgs = await getGroupDebateMessages(debateId);
		setMessages(msgs);
		setLoading(false);
	};

	const joinDebate = async () => {
		if (!session?.user?.id) return;
		await joinGroupDebate(debateId, session.user.id);
	};

	const leaveDebate = async () => {
		if (!session?.user?.id) return;
		await leaveGroupDebate(debateId, session.user.id);
	};

	const saveTopic = async () => {
		if (!newTopic.trim() || !debate) return;

		const updatedDebate = await updateGroupDebate(debateId, { topic: newTopic.trim() });
		if (updatedDebate) {
			setDebate(updatedDebate);
			setEditingTopic(false);
		}
	};

	const cancelEdit = () => {
		setNewTopic(debate?.topic || '');
		setEditingTopic(false);
	};

	const sendMessage = async () => {
		if (!inputText.trim() || !session?.user?.id) return;

		await sendGroupDebateMessage(debateId, session.user.id, inputText);
		setInputText('');
	};

	const getSenderColor = (senderType: string) => {
		if (senderType === 'ai') return '#BB86FC';
		if (senderType === 'user') return '#FF5252';
		return '#4CAF50';
	};

	if (loading) {
		return (
			<View style={[styles.container, styles.centered]}>
				<LinearGradient colors={['#0f0c29', '#1a1a2e', '#16213e']} style={styles.background}>
					<ActivityIndicator size="large" color="#BB86FC" />
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
				<Surface style={[styles.header, { paddingTop: insets.top }]} elevation={4}>
					<View style={styles.headerTop}>
						<IconButton icon="arrow-left" iconColor="#fff" onPress={() => navigation.goBack()} />
						<View style={styles.headerTitleContainer}>
							<Text style={styles.headerTitle}>DEBATE RING</Text>
							<Text style={styles.participantCount}>{participantCount} Active</Text>
						</View>
						<IconButton icon="information-outline" iconColor="#fff" onPress={() => { }} />
					</View>

					{/* Topic Banner */}
					<View style={styles.topicBanner}>
						{editingTopic ? (
							<View style={styles.topicEditContainer}>
								<TextInput
									value={newTopic}
									onChangeText={setNewTopic}
									style={styles.topicInput}
									placeholder="Enter debate topic..."
									placeholderTextColor="#666"
									maxLength={100}
								/>
								<View style={styles.topicEditButtons}>
									<IconButton
										icon="check"
										size={20}
										iconColor="#4CAF50"
										onPress={saveTopic}
									/>
									<IconButton
										icon="close"
										size={20}
										iconColor="#F44336"
										onPress={cancelEdit}
									/>
								</View>
							</View>
						) : (
							<View style={styles.topicDisplayContainer}>
								<Text style={styles.topicText}>Topic: {debate?.topic || 'Loading...'}</Text>
								{debate?.created_by === session?.user?.id && (
									<IconButton
										icon="pencil"
										size={20}
										iconColor="#BB86FC"
										onPress={() => setEditingTopic(true)}
									/>
								)}
							</View>
						)}
					</View>
				</Surface>

				{/* Chat Area */}
				<ScrollView
					ref={scrollViewRef}
					style={styles.chatContainer}
					contentContainerStyle={styles.chatContent}
					onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
				>
					{messages.map((msg) => {
						const isCurrentUser = msg.user_id === session?.user?.id;
						return (
							<View key={msg.id} style={[
								styles.messageRow,
								isCurrentUser ? styles.userRow : styles.otherRow
							]}>
								{!isCurrentUser && (
									<Avatar.Text size={32} label={msg.sender_type === 'ai' ? 'AI' : 'U'} style={styles.avatar} />
								)}

								<View style={[
									styles.messageBubble,
									isCurrentUser ? styles.userBubble :
										msg.sender_type === 'ai' ? styles.aiBubble : styles.otherUserBubble
								]}>
									{!isCurrentUser && (
										<Text style={[
											styles.senderName,
											{ color: getSenderColor(msg.sender_type) }
										]}>
											{msg.sender_type === 'ai' ? 'AI Participant' : (msg.sender_name || 'User')}
										</Text>
									)}
									<Text style={styles.messageText}>{msg.content}</Text>
									<Text style={styles.timestamp}>
										{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
									</Text>
								</View>
							</View>
						);
					})}
				</ScrollView>

				{/* Input Area */}
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
					<Surface style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 20) }]} elevation={5}>
						<View style={styles.inputWrapper}>
							<TextInput
								mode="flat"
								value={inputText}
								onChangeText={setInputText}
								placeholder="Enter the fray..."
								placeholderTextColor="#666"
								style={styles.input}
								underlineColor="transparent"
								activeUnderlineColor="transparent"
								textColor="#fff"
								onSubmitEditing={sendMessage}
							/>
							<TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
								<LinearGradient
									colors={['#FF5252', '#D32F2F']}
									style={styles.sendGradient}
								>
									<MaterialCommunityIcons name="send" size={20} color="#fff" />
								</LinearGradient>
							</TouchableOpacity>
						</View>
					</Surface>
				</KeyboardAvoidingView>
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
	centered: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	header: {
		backgroundColor: '#1e1e2e',
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#333',
	},
	headerTop: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 5,
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
	participantCount: {
		color: '#888',
		fontSize: 10,
	},
	topicBanner: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
		paddingHorizontal: 20,
		paddingVertical: 8,
		marginTop: 5,
	},
	topicDisplayContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	topicEditContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	topicText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '600',
		flex: 1,
	},
	topicInput: {
		flex: 1,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
		color: '#fff',
		fontSize: 12,
		fontWeight: '600',
		borderWidth: 1,
		borderColor: '#BB86FC',
	},
	topicEditButtons: {
		flexDirection: 'row',
		marginLeft: 8,
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
		marginBottom: 15,
		maxWidth: '85%',
	},
	userRow: {
		alignSelf: 'flex-end',
		flexDirection: 'row-reverse',
	},
	otherRow: {
		alignSelf: 'flex-start',
	},
	avatar: {
		marginRight: 8,
		backgroundColor: '#333',
	},
	messageBubble: {
		padding: 12,
		borderRadius: 16,
		minWidth: 100,
	},
	userBubble: {
		backgroundColor: '#FF5252',
		borderTopRightRadius: 4,
	},
	aiBubble: {
		backgroundColor: '#2a2a3a',
		borderTopLeftRadius: 4,
		borderWidth: 1,
		borderColor: '#BB86FC',
	},
	otherUserBubble: {
		backgroundColor: '#1e1e2e',
		borderTopLeftRadius: 4,
		borderWidth: 1,
		borderColor: '#333',
	},
	senderName: {
		fontSize: 10,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	messageText: {
		color: '#fff',
		fontSize: 14,
		lineHeight: 20,
	},
	timestamp: {
		color: 'rgba(255, 255, 255, 0.5)',
		fontSize: 8,
		alignSelf: 'flex-end',
		marginTop: 4,
	},
	inputContainer: {
		backgroundColor: '#1e1e2e',
		padding: 15,
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
