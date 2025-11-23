import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, IconButton, Surface, Avatar, Chip } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Message = {
	id: string;
	text: string;
	sender: string;
	senderType: 'user' | 'ai' | 'other_user';
	avatar?: string;
	timestamp: string;
};

const MOCK_MESSAGES: Message[] = [
	{
		id: '1',
		text: 'Universal Basic Income reduces the incentive to work.',
		sender: 'Thomas Sowell AI',
		senderType: 'ai',
		avatar: 'https://i.pravatar.cc/150?img=11',
		timestamp: '10:02 AM'
	},
	{
		id: '2',
		text: 'Actually, studies show people use the time for education.',
		sender: 'Sarah (User)',
		senderType: 'other_user',
		avatar: 'https://i.pravatar.cc/150?img=5',
		timestamp: '10:03 AM'
	},
	{
		id: '3',
		text: 'But where does the funding come from without inflation?',
		sender: 'Elon Musk AI',
		senderType: 'ai',
		avatar: 'https://i.pravatar.cc/150?img=3',
		timestamp: '10:03 AM'
	}
];

export default function GroupDebateScreen() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const route = useRoute();
	const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
	const [inputText, setInputText] = useState('');
	const scrollViewRef = useRef<ScrollView>(null);

	const sendMessage = () => {
		if (!inputText.trim()) return;
		const newMsg: Message = {
			id: Date.now().toString(),
			text: inputText,
			sender: 'You',
			senderType: 'user',
			timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		};
		setMessages([...messages, newMsg]);
		setInputText('');
	};

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
							<Text style={styles.headerTitle}>UBI DEBATE RING</Text>
							<Text style={styles.participantCount}>8 Active • 12 Spectating</Text>
						</View>
						<IconButton icon="information-outline" iconColor="#fff" onPress={() => { }} />
					</View>

					{/* Topic Banner */}
					<View style={styles.topicBanner}>
						<Text style={styles.topicText}>Topic: Is UBI Necessary?</Text>
						<View style={styles.timerContainer}>
							<MaterialCommunityIcons name="clock-outline" size={14} color="#FF5252" />
							<Text style={styles.timerText}>04:20 left</Text>
						</View>
					</View>
				</Surface>

				{/* Chat Area */}
				<ScrollView
					ref={scrollViewRef}
					style={styles.chatContainer}
					contentContainerStyle={styles.chatContent}
					onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
				>
					{messages.map((msg) => (
						<View key={msg.id} style={[
							styles.messageRow,
							msg.senderType === 'user' ? styles.userRow : styles.otherRow
						]}>
							{msg.senderType !== 'user' && (
								<Avatar.Image size={32} source={{ uri: msg.avatar }} style={styles.avatar} />
							)}

							<View style={[
								styles.messageBubble,
								msg.senderType === 'user' ? styles.userBubble :
									msg.senderType === 'ai' ? styles.aiBubble : styles.otherUserBubble
							]}>
								{msg.senderType !== 'user' && (
									<Text style={[
										styles.senderName,
										{ color: msg.senderType === 'ai' ? '#BB86FC' : '#4CAF50' }
									]}>
										{msg.sender}
									</Text>
								)}
								<Text style={styles.messageText}>{msg.text}</Text>
								<Text style={styles.timestamp}>{msg.timestamp}</Text>
							</View>
						</View>
					))}
				</ScrollView>

				{/* Input Area */}
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
					<Surface style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 20) }]} elevation={8}>
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
	topicText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '600',
	},
	timerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	timerText: {
		color: '#FF5252',
		fontSize: 12,
		fontWeight: 'bold',
		marginLeft: 4,
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
