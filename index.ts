// -------------------------------------------------------------
// 🚀 Ponto de entrada do app Estabiliza
// -------------------------------------------------------------

// 👇 Isso aqui TEM que vir primeiro — ativa suporte ao crypto.getRandomValues()
import 'react-native-get-random-values';

// ✅ Inicializa o ambiente do Expo
import { registerRootComponent } from 'expo';

// 🌿 App principal
import App from './App';

// 🔧 Registra o componente raiz no Expo
// Garante funcionamento correto tanto no Expo Go quanto em builds nativas
registerRootComponent(App);
