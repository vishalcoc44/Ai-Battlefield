import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface, IconButton, Button, ProgressBar, TextInput, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SCENARIO = {
	opponent: 'Angry Internet Troll',
	avatar: 'https://i.pravatar.cc/150?img=60',
	initialMessage: "You honestly think that? That's the dumbest thing I've ever heard. You clearly have zero empathy.",
};

export default function DeEscalationScreen() {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();
	const [inputText, setInputText] = useState('');
	const [calmScore, setCalmScore] = useState(0.5);
	const [feedback, setFeedback] = useState<string | null>(null);

	const handleAnalyze = () => {
		// Mock analysis logic
		if (inputText.toLowerCase().includes('sorry') || inputText.toLowerCase().includes('understand')) {
			setCalmScore(Math.min(calmScore + 0.2, 1));
			setFeedback("Great! You validated their feelings. (+20 Calm)");
		} else if (inputText.toLowerCase().includes('wrong') || inputText.toLowerCase().includes('stupid')) {
			setCalmScore(Math.max(calmScore - 0.2, 0));
			setFeedback("Careful! You're taking the bait. (-20 Calm)");
		} else {
			setFeedback("Neutral response. Try to bridge the gap.");
		}
		setInputText('');
	};

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
							<Avatar.Image size={40} source={{ uri: SCENARIO.avatar }} />
							<View style={styles.opponentInfo}>
								<Text style={styles.opponentName}>{SCENARIO.opponent}</Text>
								<Text style={styles.opponentStatus}>Status: TRIGGERED</Text>
							</View>
						</View>
						<View style={styles.bubble}>
							<Text style={styles.messageText}>{SCENARIO.initialMessage}</Text>
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
					>
						Analyze Response
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
});
