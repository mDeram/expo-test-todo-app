import { API_ENDPOINT } from "@/constants";

export type Todo = { id: string, value: string, saved: boolean, saving: boolean, deleted: boolean };
export type ServerTodo = Pick<Todo, "id" | "value">;

export async function deleteOnlineTodo(id: string) {
    const result = await fetch(`${API_ENDPOINT}/todo/${id}`, { method: "DELETE" });
    if (!result.ok) throw new Error("Result not ok");
}

export async function saveOnlineTodo(todo: ServerTodo) {
    const result = await fetch(`${API_ENDPOINT}/todo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: todo.id, value: todo.value })
    });
    if (!result.ok) throw new Error("Result not ok");
}

export async function loadOnlineTodos(): Promise<Todo[]> {
    const result = await fetch(`${API_ENDPOINT}/todo`);
    if (!result.ok) throw new Error("Result not ok");

    const todos: ServerTodo[] = await result.json();
    return todos.map(todo => ({
        ...todo,
        saved: true,
        saving: false,
        deleted: false
    }));
}
