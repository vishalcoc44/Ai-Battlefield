import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, IconButton, Button, ProgressBar, TextInput, Avatar, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import {
	createDeEscalationSession,
	completeDeEscalationSession,
	saveDeEscalationResponse,
	generateTrollResponse,
	analyzeResponseCalmness,
	getSessionResponses,
	DeEscalationResponse
} from '../services/deEscalationService';
import { getUserProfile } from '../services/profileService';

const SCENARIOS = [
	{
		type: 'angry_troll',
		opponent: 'Angry Internet Troll',
		avatar: 'https://i.pravatar.cc/150?img=60',
		initialMessage: "You honestly think that? That's the dumbest thing I've ever heard. You clearly have zero empathy.",
	},
	{
		type: 'bad_faith',
		opponent: 'Bad Faith Debater',
		avatar: 'https://i.pravatar.cc/150?img=65',
		initialMessage: "That's not even worth responding to. Your argument is so flawed it's embarrassing.",
	},
	{
		type: 'condescending',
		opponent: 'Condescending Expert',
		avatar: 'https://i.pravatar.cc/150?img=70',
		initialMessage: "I hate to break it to you, but you're simply not equipped to understand this topic at the level required.",
	},
];

export default function DeEscalationScreen() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const { user } = useAuth();
	const [inputText, setInputText] = useState('');
	const [calmScore, setCalmScore] = useState(0.5);
	const [feedback, setFeedback] = useState<string | null>(null);
	const [session, setSession] = useState<any>(null);
	const [scenario, setScenario] = useState(SCENARIOS[0]);
	const [responses, setResponses] = useState<DeEscalationResponse[]>([]);
	const [currentTrollMessage, setCurrentTrollMessage] = useState(SCENARIOS[0].initialMessage);
	const [analyzing, setAnalyzing] = useState(false);
	const [loading, setLoading] = useState(true);
	const [positiveResponses, setPositiveResponses] = useState(0);
	const [negativeResponses, setNegativeResponses] = useState(0);

	useEffect(() => {
		initializeSession();
	}, []);

	const initializeSession = async () => {
		if (!user) return;

		try {
			setLoading(true);
			// Get user's current calm score
			const profile = await getUserProfile(user.id);
			const initialCalmScore = profile?.calm_score || 0.5;
			setCalmScore(initialCalmScore);

			// Create a new training session
			const newSession = await createDeEscalationSession(user.id, scenario.type, initialCalmScore);
			if (newSession) {
				setSession(newSession);
			}
		} catch (error) {
			console.error('Error initializing session:', error);
			Alert.alert('Error', 'Failed to start training session');
		} finally {
			setLoading(false);
		}
	};

	const handleAnalyze = async () => {
		if (!inputText.trim() || !session || analyzing) return;

		try {
			setAnalyzing(true);

			// Analyze the user's response
			const analysis = await analyzeResponseCalmness(inputText.trim());

			// Save the response to database
			await saveDeEscalationResponse(
				session.id,
				inputText.trim(),
				currentTrollMessage,
				analysis
			);

			// Update local state
			setResponses(prev => [...prev, {
				id: Date.now().toString(),
				session_id: session.id,
				user_response: inputText.trim(),
				ai_prompt: currentTrollMessage,
				sentiment_analysis: analysis,
				created_at: new Date().toISOString()
			}]);

			// Update calm score based on analysis
			const newCalmScore = Math.max(0, Math.min(1, calmScore + (analysis.score - 0.5) * 0.3));
			setCalmScore(newCalmScore);

			// Update response counters
			if (analysis.score > 0.6) {
				setPositiveResponses(prev => prev + 1);
				setFeedback(`Excellent! You stayed calm. (+${Math.round((analysis.score - 0.5) * 60)} Calm)`);
			} else if (analysis.score < 0.4) {
				setNegativeResponses(prev => prev + 1);
				setFeedback(`Careful! You're getting agitated. (${Math.round((analysis.score - 0.5) * 60)} Calm)`);
			} else {
				setFeedback("Neutral response. Try to de-escalate further.");
			}

			// Generate next troll response
			const conversationHistory = [
				currentTrollMessage,
				inputText.trim()
			];

			const nextTrollResponse = await generateTrollResponse(
				inputText.trim(),
				conversationHistory,
				newCalmScore
			);

			setCurrentTrollMessage(nextTrollResponse);

			setInputText('');

		} catch (error) {
			console.error('Error analyzing response:', error);
			Alert.alert('Error', 'Failed to analyze response');
		} finally {
			setAnalyzing(false);
		}
	};

	const handleEndSession = async () => {
		if (!session) return;

		Alert.alert(
			'End Training Session',
			'Are you ready to complete your Zen Dojo training?',
			[
				{ text: 'Continue Training', style: 'cancel' },
				{
					text: 'Complete Session',
					onPress: async () => {
						try {
							await completeDeEscalationSession(
								session.id,
								calmScore,
								responses.length + 1, // +1 for current response
								positiveResponses,
								negativeResponses
							);
							navigation.goBack();
						} catch (error) {
							console.error('Error completing session:', error);
							Alert.alert('Error', 'Failed to complete session');
						}
					}
				}
			]
		);
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#BB86FC" />
				<Text style={styles.loadingText}>Initializing Zen Dojo...</Text>
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
					<Text style={styles.headerTitle}>ZEN DOJO</Text>
					<IconButton icon="meditation" iconColor="#fff" onPress={() => { }} />
				</View>

				<ScrollView contentContainerStyle={styles.scrollContent}>

					{/* Calm Meter */}
					<Surface style={styles.meterCard} elevation={4}>
						<View style={styles.meterHeader}>
							<Text style={styles.meterLabel}>INNER PEACE</Text>
							<Text style={[styles.meterValue, { color: calmScore > 0.7 ? '#4CAF50' : calmScore < 0.3 ? '#FF5252' : '#FFC107' }]}>
								{(calmScore * 100).toFixed(0)}%
							</Text>
						</View>
						<ProgressBar
							progress={calmScore}
							color={calmScore > 0.7 ? '#4CAF50' : calmScore < 0.3 ? '#FF5252' : '#FFC107'}
							style={styles.progressBar}
						/>
						<Text style={styles.meterHint}>Goal: Keep your cool while they lose theirs.</Text>
					</Surface>

					{/* Opponent Message */}
					<Surface style={styles.opponentCard} elevation={2}>
						<View style={styles.opponentHeader}>
							<Avatar.Image size={40} source={{ uri: scenario.avatar }} />
							<View style={styles.opponentInfo}>
								<Text style={styles.opponentName}>{scenario.opponent}</Text>
								<Text style={styles.opponentStatus}>Status: TRIGGERED</Text>
							</View>
						</View>
						<View style={styles.bubble}>
							<Text style={styles.messageText}>{currentTrollMessage}</Text>
						</View>
					</Surface>

					{/* Feedback Area */}
					{feedback && (
						<View style={styles.feedbackContainer}>
							<MaterialCommunityIcons
								name={feedback.includes('Great') ? "check-circle" : "alert-circle"}
								size={20}
								color={feedback.includes('Great') ? "#4CAF50" : "#FF5252"}
							/>
							<Text style={styles.feedbackText}>{feedback}</Text>
						</View>
					)}

					{/* Response Input */}
					<Text style={styles.inputLabel}>Your De-escalation Response:</Text>
					<TextInput
						mode="outlined"
						value={inputText}
						onChangeText={setInputText}
						placeholder="Type a calm response..."
						placeholderTextColor="#666"
						style={styles.input}
						outlineColor="#333"
						activeOutlineColor="#BB86FC"
						textColor="#fff"
						multiline
						numberOfLines={3}
					/>

					<Button
						mode="contained"
						onPress={handleAnalyze}
						style={styles.actionButton}
						icon="brain"
						disabled={analyzing || !inputText.trim()}
						loading={analyzing}
					>
						{analyzing ? 'Analyzing...' : 'Analyze Response'}
					</Button>

					<Button
						mode="outlined"
						onPress={handleEndSession}
						style={[styles.actionButton, { marginTop: 10 }]}
						icon="meditation"
						textColor="#4CAF50"
					>
						End Training Session
					</Button>

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
		paddingBottom: 50,
	},
	meterCard: {
		backgroundColor: '#1e1e2e',
		borderRadius: 16,
		padding: 20,
		marginBottom: 30,
		borderWidth: 1,
		borderColor: '#333',
	},
	meterHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	meterLabel: {
		color: '#aaa',
		fontSize: 12,
		fontWeight: 'bold',
		letterSpacing: 1,
	},
	meterValue: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	progressBar: {
		height: 10,
		borderRadius: 5,
		backgroundColor: '#333',
		marginBottom: 10,
	},
	meterHint: {
		color: '#666',
		fontSize: 12,
		fontStyle: 'italic',
		textAlign: 'center',
	},
	opponentCard: {
		backgroundColor: 'rgba(255, 82, 82, 0.1)',
		borderRadius: 16,
		padding: 20,
		marginBottom: 20,
		borderWidth: 1,
		borderColor: 'rgba(255, 82, 82, 0.3)',
	},
	opponentHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 15,
	},
	opponentInfo: {
		marginLeft: 10,
	},
	opponentName: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	opponentStatus: {
		color: '#FF5252',
		fontSize: 10,
		fontWeight: 'bold',
	},
	bubble: {
		backgroundColor: '#2a2a3a',
		padding: 15,
		borderRadius: 12,
		borderTopLeftRadius: 0,
	},
	messageText: {
		color: '#fff',
		fontSize: 16,
		lineHeight: 24,
	},
	feedbackContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		padding: 10,
		borderRadius: 8,
		marginBottom: 20,
	},
	feedbackText: {
		color: '#fff',
		marginLeft: 10,
		fontSize: 14,
	},
	inputLabel: {
		color: '#aaa',
		marginBottom: 10,
		fontSize: 14,
	},
	input: {
		backgroundColor: '#1e1e2e',
		marginBottom: 20,
	},
	actionButton: {
		backgroundColor: '#BB86FC',
		borderRadius: 25,
		paddingVertical: 6,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#0f0c29',
	},
	loadingText: {
		color: '#BB86FC',
		marginTop: 10,
		fontSize: 16,
	},
});
