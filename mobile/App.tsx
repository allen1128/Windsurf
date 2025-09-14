import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Provider as PaperProvider} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import ScanScreen from './src/screens/ScanScreen';
import BookDetailsScreen from './src/screens/BookDetailsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Context
import {AuthProvider} from './src/context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Library') {
            iconName = 'library-books';
          } else if (route.name === 'Scan') {
            iconName = 'camera-alt';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6B4E71',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#6B4E71',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}>
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen}
        options={{title: 'My Library'}}
      />
      <Tab.Screen 
        name="Scan" 
        component={ScanScreen}
        options={{title: 'Scan Book'}}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{title: 'Profile'}}
      />
    </Tab.Navigator>
  );
}

function App(): JSX.Element {
  return (
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#6B4E71',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen 
              name="Main" 
              component={MainTabs}
              options={{headerShown: false}}
            />
            <Stack.Screen 
              name="BookDetails" 
              component={BookDetailsScreen}
              options={{title: 'Book Details'}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}

export default App;
