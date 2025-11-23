import React from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { Text, Card, Avatar, useTheme, Surface, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const PERSONAS = [
	{
		id: '1',
		name: 'Thomas Sowell (2025)',
		topic: 'Welfare & Economics',
		avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Thomas_Sowell_2013.jpg/220px-Thomas_Sowell_2013.jpg',
		description: 'Facts over feelings. Expect rigorous economic analysis.',
		difficulty: 'Hard',
	},
	{
		id: '2',
		name: 'Richard Dawkins',
		topic: 'Existence of God',
		avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Richard_Dawkins_Cooper_Union_2010.jpg/220px-Richard_Dawkins_Cooper_Union_2010.jpg',
		description: 'Unapologetic rationalism and evolutionary biology.',
		difficulty: 'Hard',
	},
	{
		id: '3',
		name: 'Scott Alexander + Bryan Caplan',
		topic: 'Open Borders',
		avatar: 'https://pbs.twimg.com/profile_images/1234567890/placeholder.jpg',
		description: 'Utilitarian ethics meets libertarian economics.',
		difficulty: 'Medium',
	},
	{
		id: '4',
		name: 'The Devil\'s Advocate',
		topic: 'Any Topic',
		avatar: 'https://cdn-icons-png.flaticon.com/512/190/190609.png',
		description: 'The smartest living expert who disagrees with you.',
		difficulty: 'Extreme',
	},
];

export default function PersonaSelectionScreen() {
	const navigation = useNavigation<any>();

	const renderItem = ({ item }: { item: typeof PERSONAS[0] }) => (
		<Surface style={styles.cardContainer} elevation={4}>
			<Card
				style={styles.card}
				onPress={() => navigation.navigate('Debate', { persona: item })}
				contentStyle={styles.cardInner}
			>
				<View style={styles.row}>
					<Avatar.Image size={70} source={{ uri: item.avatar }} style={styles.avatar} />
					<View style={styles.textContainer}>
						<View style={styles.headerRow}>
							<Text variant="titleMedium" style={styles.name}>{item.name}</Text>
							<View style={styles.badge}>
								<Text style={styles.badgeText}>{item.difficulty}</Text>
							</View>
						</View>
						<Text variant="bodySmall" style={styles.topic}>{item.topic}</Text>
						<Text variant="bodySmall" numberOfLines={2} style={styles.description}>{item.description}</Text>
					</View>
					<IconButton icon="chevron-right" iconColor="#BB86FC" size={24} />
				</View>
			</Card>
		</Surface>
	);

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#0f0c29', '#302b63', '#24243e']}
				style={styles.background}
			>
				<View style={styles.header}>
					<IconButton icon="arrow-left" iconColor="#fff" onPress={() => navigation.goBack()} />
					<Text variant="headlineSmall" style={styles.headerTitle}>CHOOSE OPPONENT</Text>
					<View style={{ width: 40 }} />
				</View>

				<FlatList
					data={PERSONAS}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.list}
					showsVerticalScrollIndicator={false}
				/>
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
		paddingTop: 50,
		paddingBottom: 20,
		paddingHorizontal: 10,
	},
	headerTitle: {
		fontWeight: 'bold',
		color: '#fff',
		letterSpacing: 1,
	},
	list: {
		padding: 16,
		paddingBottom: 40,
	},
	cardContainer: {
		marginBottom: 16,
		borderRadius: 16,
		backgroundColor: 'transparent',
		overflow: 'hidden',
	},
	card: {
		backgroundColor: 'rgba(30, 30, 30, 0.8)',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)',
	},
	cardInner: {
		padding: 5,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 10,
	},
	avatar: {
		backgroundColor: '#333',
	},
	textContainer: {
		marginLeft: 16,
		flex: 1,
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	name: {
		fontWeight: 'bold',
		color: '#fff',
		flex: 1,
		marginRight: 8,
	},
	badge: {
		backgroundColor: 'rgba(187, 134, 252, 0.2)',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
	},
	badgeText: {
		color: '#BB86FC',
		fontSize: 10,
		fontWeight: 'bold',
	},
	topic: {
		color: '#BB86FC',
		marginBottom: 4,
		fontSize: 12,
	},
	description: {
		color: '#aaa',
		fontSize: 12,
	},
});
