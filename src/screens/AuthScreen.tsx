import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [loading, setLoading] = useState(false);
	const [isLogin, setIsLogin] = useState(true);

	async function handleAuth() {
		setLoading(true);

		if (isLogin) {
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) {
				alert(error.message);
			}
			setLoading(false);
			return;
		}

		// Sign up flow
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					username: username.trim() || null,
				}
			}
		});

		if (error) {
			alert(error.message);
		} else if (data.user) {
			// Create profile with username if provided
			if (username.trim()) {
				const { error: profileError } = await supabase
					.from('profiles')
					.insert({
						id: data.user.id,
						username: username.trim(),
					});
				if (profileError) {
					console.error('Error creating profile:', profileError);
				}
			}
			alert('Check your inbox for email verification!');
		}
		setLoading(false);
	}

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#0f0c29', '#302b63', '#24243e']}
				style={styles.background}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					style={styles.keyboardView}
				>
					<Surface style={styles.card} elevation={4}>
						<Text variant="displaySmall" style={styles.title}>
							AI BATTLEFIELD
						</Text>
						<Text variant="bodyMedium" style={styles.subtitle}>
							{isLogin ? 'Enter the Arena' : 'Join the Ranks'}
						</Text>

						<TextInput
							label="Email"
							value={email}
							onChangeText={setEmail}
							autoCapitalize="none"
							mode="outlined"
							style={styles.input}
							theme={{ colors: { primary: '#BB86FC', outline: '#555' } }}
							textColor="#fff"
						/>
						{!isLogin && (
							<TextInput
								label="Display Name (Optional)"
								value={username}
								onChangeText={setUsername}
								autoCapitalize="words"
								mode="outlined"
								style={styles.input}
								theme={{ colors: { primary: '#BB86FC', outline: '#555' } }}
								textColor="#fff"
								placeholder="Choose your display name"
								maxLength={30}
							/>
						)}
						<TextInput
							label="Password"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							autoCapitalize="none"
							mode="outlined"
							style={styles.input}
							theme={{ colors: { primary: '#BB86FC', outline: '#555' } }}
							textColor="#fff"
						/>

						<Button
							mode="contained"
							onPress={handleAuth}
							loading={loading}
							style={styles.button}
							contentStyle={styles.buttonContent}
							labelStyle={styles.buttonLabel}
						>
							{isLogin ? 'ENGAGE' : 'INITIATE'}
						</Button>

						<Button
							mode="text"
							onPress={() => setIsLogin(!isLogin)}
							textColor="#BB86FC"
							style={styles.switchButton}
						>
							{isLogin ? 'New recruit? Sign Up' : 'Veteran? Sign In'}
						</Button>
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
		justifyContent: 'center',
		alignItems: 'center',
	},
	keyboardView: {
		width: '100%',
		alignItems: 'center',
	},
	card: {
		padding: 30,
		width: width * 0.9,
		maxWidth: 400,
		borderRadius: 20,
		backgroundColor: 'rgba(30, 30, 30, 0.9)',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(187, 134, 252, 0.3)',
	},
	title: {
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 5,
		letterSpacing: 2,
		textAlign: 'center',
	},
	subtitle: {
		color: '#aaa',
		marginBottom: 30,
		textAlign: 'center',
	},
	input: {
		width: '100%',
		marginBottom: 15,
		backgroundColor: '#2c2c2c',
	},
	button: {
		width: '100%',
		marginTop: 10,
		borderRadius: 8,
		backgroundColor: '#BB86FC',
	},
	buttonContent: {
		height: 50,
	},
	buttonLabel: {
		fontSize: 16,
		fontWeight: 'bold',
		letterSpacing: 1,
	},
	switchButton: {
		marginTop: 15,
	},
});
