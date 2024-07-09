import { View, TextInput, FlatList, Text, Pressable, Keyboard } from 'react-native';
import { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Todo, useTodos } from '@/components/Todo';
import { SyncedIcon } from '@/components/SyncedIcon';

export default function HomeScreen() {
    const [value, setValue] = useState("");
    const [inputOpen, setInputOpen] = useState(false);
    const { synced, loaded, todos, addTodo, removeTodo } = useTodos();

    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener(
            "keyboardDidHide",
            () => setInputOpen(false)
        );

        return () => keyboardDidHideListener.remove();
    });

    const handleAddTodo = () => {
        addTodo(value);
        setValue("");
    }

    if (!loaded) return null;

    return (
        <View style={{ flex: 1 }}>
            <View style={{
                flex: 1,
                marginLeft: 20,
                marginRight: 20,
                marginTop: 40,
            }}>
                <Text style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: 20,
                }}>
                    Todo
                </Text>
                <SyncedIcon synced={synced} />
                {todos.length === 0 && (
                    <Text style={{ color: "gray" }}>Let's add some tasks!</Text>
                )}
                <FlatList
                    contentContainerStyle={{
                        gap: 16
                    }}
                    data={todos}
                    renderItem={({ item }) => <Todo handleMarkAsDone={() => removeTodo(item.id)} {...item} />}
                    keyExtractor={item => item.id.toString()}
                />
            </View>
            {inputOpen && (
                <View
                    style={{
                        width: "100%",
                        height: 60,
                        borderColor: "lightgray",
                        borderTopWidth: 1,
                    }}
                >
                <TextInput
                    autoFocus
                    value={value}
                    onChangeText={setValue}
                    style={{
                        fontSize: 24,
                        marginBottom: 4,
                        height: "100%",
                        paddingLeft: 20,
                        paddingRight: 20
                    }}
                    onSubmitEditing={handleAddTodo}
                    blurOnSubmit={false}
                    onBlur={() => setInputOpen(false)}
                />
                </View>
            )}
            {!inputOpen && (
                <View
                    style={{
                        position: "absolute",
                        bottom: 60,
                        right: 20,
                        height: 64,
                        width: 64,
                    }}
                >
                    <Pressable
                        style={{
                            borderRadius: 100,
                            backgroundColor: "black",
                            width: "100%",
                            height: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onPress={() => setInputOpen(true)}
                        accessibilityLabel="Add todo to list"
                    >
                        <FontAwesome size={32} style={{ paddingTop: 0, color: "white" }} name="plus" />
                    </Pressable>
                </View>
            )}
        </View>
    );
}
