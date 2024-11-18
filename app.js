# app.js
// Store data (in a real app, this would be in a database)
let users = [];
let currentUser = null;

// Page content
const pages = {
    home: function() {
        return `
            <div class="bg-white">
                <div class="max-w-6xl mx-auto px-4 py-16">
                    <div class="text-center">
                        <h1 class="text-4xl font-bold text-gray-900 mb-4">
                            Asegura tus Transacciones con Garantía
                        </h1>
                        <p class="text-xl text-gray-600 mb-8">
                            Mantén los fondos seguros hasta que ambas partes confirmen la operación
                        </p>
                        <div class="flex justify-center space-x-4">
                            <button onclick="showRegistration('buyer')" 
                                    class="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700">
                                Registrarse como Comprador
                            </button>
                            <button onclick="showRegistration('seller')" 
                                    class="bg-white text-emerald-600 px-6 py-3 rounded-lg border-2 border-emerald-600 hover:bg-emerald-50">
                                Registrarse como Vendedor
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-6xl mx-auto px-4 py-16">
                <h2 class="text-3xl font-bold text-center mb-12">Proceso Simple en 5 Pasos</h2>
                <!-- Steps content -->
            </div>
        `;
    },
    register: function() {
        return `
            <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h2 class="text-2xl font-bold mb-6">Registro</h2>
                <form id="registerForm" onsubmit="handleRegister(event)" class="space-y-4">
                    <div>
                        <label class="block text-gray-700">Nombre</label>
                        <input type="text" name="name" required 
                               class="mt-1 block w-full rounded-md border border-gray-300 p-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">Email</label>
                        <input type="email" name="email" required 
                               class="mt-1 block w-full rounded-md border border-gray-300 p-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">Contraseña</label>
                        <input type="password" name="password" required 
                               class="mt-1 block w-full rounded-md border border-gray-300 p-2">
                    </div>
                    <button type="submit" 
                            class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                        Registrarse
                    </button>
                </form>
            </div>
        `;
    },
    login: function() {
        return `
            <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h2 class="text-2xl font-bold mb-6">Iniciar Sesión</h2>
                <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-4">
                    <div>
                        <label class="block text-gray-700">Email</label>
                        <input type="email" name="email" required 
                               class="mt-1 block w-full rounded-md border border-gray-300 p-2">
                    </div>
                    <div>
                        <label class="block text-gray-700">Contraseña</label>
                        <input type="password" name="password" required 
                               class="mt-1 block w-full rounded-md border border-gray-300 p-2">
                    </div>
                    <button type="submit" 
                            class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                        Ingresar
                    </button>
                </form>
            </div>
        `;
    }
};

// Navigation functions
function navigateTo(page) {
    const mainContent = document.getElementById('main-content');
    if (mainContent && pages[page]) {
        mainContent.innerHTML = pages[page]();
        // Update URL without page reload
        history.pushState({}, '', `/veripay/${page}`);
    }
}

function showRegistration(type) {
    navigateTo('register');
    // Store the registration type for form handling
    localStorage.setItem('registrationType', type);
}

// Form handlers
function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    console.log('Login attempt:', { email }); // For testing
    // Add your login logic here
}

function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        type: localStorage.getItem('registrationType') || 'buyer'
    };
    
    console.log('Registration:', userData); // For testing
    // Add your registration logic here
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Setup navigation event listeners
    document.querySelectorAll('[data-nav]').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(e.target.dataset.nav);
        });
    });

    // Initialize Lucide icons
    lucide.createIcons();
});
