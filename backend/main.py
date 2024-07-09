from flask import Flask, jsonify, request
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class Base(DeclarativeBase):
    pass

class Todo(Base):
    __tablename__ = 'todo'

    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    value: Mapped[str]  = mapped_column(unique=False, index=False)

    @property
    def serialize(self):
        return {
            'id': self.id,
            'value': self.value
        }

db_connection_string = "sqlite:///todo.db"
db = create_engine(db_connection_string)

Base.metadata.create_all(db)

@app.route("/test")
def test():
    return jsonify("Working")

@app.route("/todo")
def get_todos():
    with Session(db) as session:
        todos = session.query(Todo).all()
    return jsonify([i.serialize for i in todos])

@app.route("/todo", methods=["POST"])
def create_todo():
    body = request.json
    if body is None:
        return jsonify("Invalid body"), 400
    try:
        id = body['id']
        value = body['value']
    except Exception:
        return jsonify("Invalid body"), 400

    if id is None or value is None or type(id) is not str or type(value) is not str:
        return jsonify("Invalid body"), 400

    with Session(db) as session:
        new_todo = Todo(id=id, value=value)
        session.add(new_todo)
        try:
            session.commit()
        except IntegrityError as e:
            print(e)
            return jsonify("Already exist"), 409

        return jsonify(new_todo.serialize), 201

@app.route("/todo/<id>", methods=["DELETE"])
def delete_todo(id):
    with Session(db) as session:
        session.query(Todo).where(Todo.id == id).delete()
        session.commit()

    return jsonify("Deleted")

app.run(debug=True, host="0.0.0.0", port=8000)
