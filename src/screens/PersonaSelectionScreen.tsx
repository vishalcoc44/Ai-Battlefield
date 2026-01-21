import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, Card, Avatar, Surface, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

interface Persona {
	id: string;
	name: string;
	topic: string;
	avatar_url: string;
	description: string;
	difficulty: string;
	personality_prompt: string;
}

export default function PersonaSelectionScreen() {
	const navigation = useNavigation<any>();
	const [personas, setPersonas] = useState<Persona[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadPersonas();
	}, []);

	const loadPersonas = async () => {
		setLoading(true);
		const { data, error } = await supabase
			.from('personas')
			.select('*')
			.eq('is_active', true)
			.order('difficulty', { ascending: true });

		if (!error && data) {
			setPersonas(data);
		}
		setLoading(false);
	};

	const renderItem = ({ item }: { item: Persona }) => (
		<Surface style={styles.cardContainer} elevation={4}>
			<Card
				style={styles.card}
				onPress={() => navigation.navigate('Debate', { persona: item })}
				contentStyle={styles.cardInner}
			>
				<View style={styles.row}>
					<Avatar.Image size={70} source={{ uri: item.avatar_url }} style={styles.avatar} />
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

	if (loading) {
		return (
			<View style={[styles.container, styles.centered]}>
				<LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.background}>
					<ActivityIndicator size="large" color="#BB86FC" />
				</LinearGradient>
			</View>
		);
	}

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
					data={personas}
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
	centered: {
		justifyContent: 'center',
		alignItems: 'center',
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
