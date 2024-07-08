import { View, Text, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'
import { nanoid } from 'nanoid';

const STORAGE_KEY = "todos";

type Todo = { id: string, value: string };
type TodoProps = { handleMarkAsDone: () => void } & Todo;

export function Todo({ value, handleMarkAsDone }: TodoProps) {
    return (
        <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            width: "80%"
        }}>
            <Pressable
                style={{
                    borderRadius: 100,
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onPress={handleMarkAsDone}
                accessibilityLabel="Mark as done"
            >
                <FontAwesome size={32} style={{ paddingTop: 0 }} name="circle-thin" />
            </Pressable>
            <Text style={{ color: "black", fontSize: 24 }}>{value}</Text>
        </View>
    );
}

interface UseTodos {
    todos: Todo[];
    addTodo: (value: string) => void;
    removeTodo: (id: string) => void;
}

export function useTodos(): UseTodos {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        async function loadTodos() {
            try {
                const value = await AsyncStorage.getItem(STORAGE_KEY);
                if (value !== null) {
                    const savedTodos = JSON.parse(value);
                    setTodos(savedTodos);
                }
                setLoaded(true);
            } catch (err) {
                console.error(err);
                // TODO error
            }
        }

        loadTodos();
    }, []);

    useEffect(() => {
        if (!loaded) return;

        async function saveTodos() {
            try {
                const value = JSON.stringify(todos);
                await AsyncStorage.setItem(STORAGE_KEY, value);
            } catch (err) {
                console.error(err);
                // TODO error
            }
        }

        saveTodos();
    }, [loaded, todos]);

    const addTodo: UseTodos["addTodo"] = (value) => {
        setTodos(prev => [...prev, {
            id: nanoid(),
            value
        }]);
    }

    const removeTodo: UseTodos["removeTodo"] = (id) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    }

    return { todos, addTodo, removeTodo };
}
