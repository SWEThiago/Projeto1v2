document.addEventListener('DOMContentLoaded', function () {
    const showroomBtn = document.getElementById('showroom-btn');
    const testDriveBtn = document.getElementById('testdrive-btn');
    const addVehicleBtn = document.getElementById('add-vehicle-btn');
    const carSection = document.getElementById('car-section');
    const jeepCarsSection = document.getElementById('jeep-cars');
    const ramCarsSection = document.getElementById('ram-cars');

    let currentCategory = ''; // Variável para armazenar a categoria selecionada

    // Função para mostrar a seção dos carros e o botão de adicionar veículo
    function showCarSection() {
        carSection.style.display = 'flex';
        addVehicleBtn.style.display = 'block';
    }

    // Exibir carros do showroom
    showroomBtn.addEventListener('click', function () {
        currentCategory = 'showroom';
        showCarSection();
        loadCars(currentCategory);
    });

    // Exibir carros do test drive
    testDriveBtn.addEventListener('click', function () {
        currentCategory = 'test_drive';
        showCarSection();
        loadCars(currentCategory);
    });

    // Função para carregar carros de uma categoria (showroom ou test_drive)
    function loadCars(category) {
        fetch(`/api/cars?category=${category}`)
            .then(response => response.json())
            .then(data => {
                renderCarList(data[category]);
            })
            .catch(error => console.error('Erro ao carregar carros:', error));
    }

    // Função para renderizar a lista de carros
    function renderCarList(cars) {
        jeepCarsSection.innerHTML = ''; // Limpa a lista anterior
        ramCarsSection.innerHTML = '';  // Limpa a lista anterior

        cars.forEach(car => {
            if (car && car.modelo && car.marca) {  // Verifica se o carro tem dados válidos
                const carElement = document.createElement('div');
                carElement.classList.add('car-item');
                carElement.innerHTML = `
                    <h3>${car.ano} ${car.modelo}</h3>
                    <div class="car-details" style="display:none;">
                        <p>Cor: ${car.cor}</p>
                        <p>Motor: ${car.motor}</p>
                        <p>Kilometragem: ${car.km} km</p>
                        <p>Combustível: ${car.combustivel.porcentagem}% - ${car.combustivel.observacao}</p>
                        <button class="edit-car" data-model="${car.modelo}">Editar</button>
                        <button class="remove-car" data-model="${car.modelo}">Remover</button>
                    </div>
                `;

                // Mostrar detalhes ao clicar
                carElement.addEventListener('click', function () {
                    const details = this.querySelector('.car-details');
                    details.style.display = details.style.display === 'none' ? 'block' : 'none';
                });

                // Distribui entre as colunas de acordo com a marca
                if (car.marca.toLowerCase() === 'jeep') {
                    jeepCarsSection.appendChild(carElement);
                } else if (car.marca.toLowerCase() === 'ram') {
                    ramCarsSection.appendChild(carElement);
                }
            }
        });
        attachCarActions();
    }

    // Função para anexar ações de edição e remoção aos botões
    function attachCarActions() {
        const editButtons = document.querySelectorAll('.edit-car');
        const removeButtons = document.querySelectorAll('.remove-car');

        editButtons.forEach(button => {
            button.addEventListener('click', function (event) {
                event.stopPropagation();  // Evita que o clique abra/feche os detalhes
                const modelo = this.getAttribute('data-model');
                editCar(modelo);
            });
        });

        removeButtons.forEach(button => {
            button.addEventListener('click', function (event) {
                event.stopPropagation();  // Evita que o clique abra/feche os detalhes
                const modelo = this.getAttribute('data-model');
                removeCar(modelo);
            });
        });
    }

    // Função para remover carro
    function removeCar(modelo) {
        fetch('/api/remove_car', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: currentCategory, modelo: modelo })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadCars(currentCategory); // Recarregar a lista de carros após remover
        })
        .catch(error => console.error('Erro ao remover carro:', error));
    }

    // Função para editar quilometragem e combustível do carro
    function editCar(modelo) {
        const newKm = prompt("Insira a nova quilometragem:");
        const newFuel = prompt("Insira a nova porcentagem de combustível:");

        fetch('/api/edit_car', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: currentCategory, modelo: modelo, km: newKm, combustivel: newFuel })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadCars(currentCategory); // Recarregar a lista de carros após edição
        })
        .catch(error => console.error('Erro ao editar carro:', error));
    }

    // Função para adicionar novo veículo
    addVehicleBtn.addEventListener('click', function () {
        const newCar = {
            marca: prompt("Marca (Jeep ou Ram):"),
            modelo: prompt("Modelo:"),
            cor: prompt("Cor:"),
            motor: prompt("Motor:"),
            ano: prompt("Ano:"),
            km: prompt("Quilometragem:"),
            combustivel: {
                porcentagem: prompt("Porcentagem de combustível:"),
                observacao: prompt("Observação do combustível:")
            }
        };

        // Valida se todos os campos obrigatórios foram preenchidos
        if (!newCar.marca || !newCar.modelo || !newCar.ano || !newCar.km || !newCar.combustivel.porcentagem) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        fetch('/api/add_car', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: currentCategory, new_car: newCar })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadCars(currentCategory); // Recarregar a lista de carros após adicionar
        })
        .catch(error => console.error('Erro ao adicionar carro:', error));
    });
});
