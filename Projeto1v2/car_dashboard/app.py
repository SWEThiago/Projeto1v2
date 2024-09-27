from flask import Flask, render_template, jsonify, request
import json

app = Flask(__name__)

# Carregar os dados do JSON
def load_data():
    with open('data/cars.json', 'r') as f:
        data = json.load(f)
    return data

# Salvar os dados no JSON
def save_data(data):
    with open('data/cars.json', 'w') as f:
        json.dump(data, f, indent=4)

# Rota principal que renderiza o HTML
@app.route('/')
def index():
    return render_template('index.html')

# Rota para obter os dados do showroom e test drive
@app.route('/api/cars', methods=['GET'])
def get_cars():
    data = load_data()
    return jsonify(data)

# Rota para adicionar um veículo
@app.route('/api/add_car', methods=['POST'])
def add_car():
    data = load_data()
    category = request.json.get('category')  # "showroom" ou "test_drive"
    new_car = request.json.get('new_car')

    if category in data:
        data[category].append(new_car)
        save_data(data)
        return jsonify({"message": "Veículo adicionado com sucesso!"}), 201
    return jsonify({"message": "Categoria não encontrada!"}), 404

# Rota para remover um veículo
@app.route('/api/remove_car', methods=['DELETE'])
def remove_car():
    data = load_data()
    category = request.json.get('category')  # "showroom" ou "test_drive"
    modelo = request.json.get('modelo')

    if category in data:
        data[category] = [car for car in data[category] if car['modelo'] != modelo]
        save_data(data)
        return jsonify({"message": "Veículo removido com sucesso!"}), 200
    return jsonify({"message": "Categoria não encontrada!"}), 404

# Rota para editar gasolina e quilometragem de um veículo
@app.route('/api/edit_car', methods=['PUT'])
def edit_car():
    data = load_data()
    category = request.json.get('category')  # "showroom" ou "test_drive"
    modelo = request.json.get('modelo')
    new_km = request.json.get('km')
    new_combustivel = request.json.get('combustivel')

    if category in data:
        for car in data[category]:
            if car['modelo'] == modelo:
                car['km'] = new_km
                car['combustivel']['porcentagem'] = new_combustivel
                save_data(data)
                return jsonify({"message": "Veículo atualizado com sucesso!"}), 200
    return jsonify({"message": "Veículo não encontrado!"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

