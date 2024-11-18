// app.js
const routes = {
    '/': 'home',
    '/login': 'login',
    '/register': 'register',
    '/buyer-dashboard': 'buyer-dashboard',
    '/seller-dashboard': 'seller-dashboard',
    '/create-agreement': 'create-agreement',
    '/deposit': 'deposit',
    '/delivery': 'delivery',
    '/review': 'review',
    '/feedback': 'feedback'
};

// Store data (in a real app, this would be in a database)
let users = [];
let currentUser = null;
let agreements = [];
let transactions = [];

// Mock data for testing
const mockAgreements = [
    {
        id: '1',
        buyerId: '1',
        sellerId: '2',
        amount: 5000,
        status: 'pending_deposit',
        terms: 'Entrega de producto electrónico',
        created: new Date(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }
];

// Transaction statuses
const STATUS = {
    PENDING_DEPOSIT: 'pending_deposit',
    FUNDS_SECURED: 'funds_secured',
    PENDING_DELIVERY: 'pending_delivery',
    PENDING_CONFIRMATION: 'pending_confirmation',
    COMPLETED: 'completed',
    DISPUTED: 'disputed'
};

// Simple router
function navigateTo(path) {
    window.history.pushState({}, '', path);
    renderPage(path);
}

// Page renderer
function renderPage(path) {
    const page = routes[path] || 'not-found';
    const mainContent = document.getElementById('main-content');
    
    switch(page) {
        case 'home':
            mainContent.innerHTML = renderHome();
            break;
        case 'login':
            mainContent.innerHTML = renderLogin();
            break;
        case 'register':
            mainContent.innerHTML = renderRegister();
            break;
        case 'buyer-dashboard':
            if (!currentUser) {
                navigateTo('/login');
                return;
            }
            mainContent.innerHTML = renderBuyerDashboard();
            break;
        case 'seller-dashboard':
            if (!currentUser) {
                navigateTo('/login');
                return;
            }
            mainContent.innerHTML = renderSellerDashboard();
            break;
        // Add other cases for different pages
        default:
            mainContent.innerHTML = renderNotFound();
    }

    // Initialize any event listeners for the new page
    initializePageListeners(page);
}

// Agreement Management
function createAgreement(data) {
    const agreement = {
        id: Date.now().toString(),
        buyerId: currentUser.id,
        sellerId: null, // Will be set when seller accepts
        sellerEmail: data.sellerEmail,
        amount: parseFloat(data.amount),
        status: STATUS.PENDING_DEPOSIT,
        terms: data.terms,
        created: new Date(),
        deadline: new Date(data.deadline),
    };
    agreements.push(agreement);
    return agreement;
}

function updateAgreementStatus(agreementId, newStatus) {
    const agreement = agreements.find(a => a.id === agreementId);
    if (agreement) {
        agreement.status = newStatus;
        renderPage(window.location.pathname); // Refresh the current page
    }
}

// Page templates
function renderCreateAgreement() {
    return `
        <div class="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-6">Crear Nuevo Acuerdo</h2>
            <form id="agreement-form" class="space-y-4">
                <div>
                    <label class="block text-gray-700">Email del Vendedor</label>
                    <input type="email" name="sellerEmail" required 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div>
                    <label class="block text-gray-700">Monto (MXN)</label>
                    <input type="number" name="amount" required min="1" step="0.01"
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div>
                    <label class="block text-gray-700">Términos del Acuerdo</label>
                    <textarea name="terms" required rows="4"
                              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                </div>
                <div>
                    <label class="block text-gray-700">Fecha Límite</label>
                    <input type="date" name="deadline" required
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <button type="submit" 
                        class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                    Crear Acuerdo
                </button>
            </form>
        </div>
    `;
}

function renderDepositFunds(agreement) {
    return `
        <div class="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-6">Depositar Fondos</h2>
            <div class="mb-6">
                <h3 class="font-bold text-lg mb-2">Resumen del Acuerdo</h3>
                <div class="bg-gray-50 p-4 rounded">
                    <p><span class="font-medium">Vendedor:</span> ${agreement.sellerEmail}</p>
                    <p><span class="font-medium">Monto:</span> MXN ${agreement.amount.toFixed(2)}</p>
                    <p><span class="font-medium">Términos:</span> ${agreement.terms}</p>
                    <p><span class="font-medium">Fecha Límite:</span> ${agreement.deadline.toLocaleDateString()}</p>
                </div>
            </div>
            <form id="deposit-form" class="space-y-4">
                <input type="hidden" name="agreementId" value="${agreement.id}">
                <div>
                    <label class="block text-gray-700">Método de Pago</label>
                    <select name="paymentMethod" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="card">Tarjeta de Crédito</option>
                        <option value="transfer">Transferencia Bancaria</option>
                        <option value="oxxo">OXXO</option>
                    </select>
                </div>
                <div id="card-fields">
                    <div>
                        <label class="block text-gray-700">Número de Tarjeta</label>
                        <input type="text" name="cardNumber" placeholder="4242 4242 4242 4242"
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-700">Fecha de Expiración</label>
                            <input type="text" name="expiry" placeholder="MM/YY"
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        </div>
                        <div>
                            <label class="block text-gray-700">CVV</label>
                            <input type="text" name="cvv" placeholder="123"
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        </div>
                    </div>
                </div>
                <button type="submit" 
                        class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                    Depositar MXN ${agreement.amount.toFixed(2)}
                </button>
            </form>
        </div>
    `;
}

// Page templates
function renderLogin() {
    return `
        <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-6">Iniciar Sesión</h2>
            <form id="login-form" class="space-y-4">
                <div>
                    <label class="block text-gray-700">Email</label>
                    <input type="email" name="email" required 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div>
                    <label class="block text-gray-700">Contraseña</label>
                    <input type="password" name="password" required 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <button type="submit" 
                        class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                    Ingresar
                </button>
            </form>
            <p class="mt-4 text-center">
                ¿No tienes cuenta? 
                <a href="#" onclick="navigateTo('/register')" class="text-emerald-600">Regístrate</a>
            </p>
        </div>
    `;
}

function renderRegister() {
    return `
        <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-6">Registro</h2>
            <form id="register-form" class="space-y-4">
                <div>
                    <label class="block text-gray-700">Nombre</label>
                    <input type="text" name="name" required 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div>
                    <label class="block text-gray-700">Email</label>
                    <input type="email" name="email" required 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div>
                    <label class="block text-gray-700">Contraseña</label>
                    <input type="password" name="password" required 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div>
                    <label class="block text-gray-700">Tipo de cuenta</label>
                    <select name="role" required 
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="buyer">Comprador</option>
                        <option value="seller">Vendedor</option>
                    </select>
                </div>
                <div id="seller-fields" class="hidden">
                    <label class="block text-gray-700">Documentos de verificación</label>
                    <input type="file" name="verification" 
                           class="mt-1 block w-full">
                </div>
                <button type="submit" 
                        class="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                    Registrarse
                </button>
            </form>
        </div>
    `;
}

function getStatusBadge(status) {
    const statusColors = {
        [STATUS.PENDING_DEPOSIT]: 'bg-yellow-100 text-yellow-800',
        [STATUS.FUNDS_SECURED]: 'bg-blue-100 text-blue-800',
        [STATUS.PENDING_DELIVERY]: 'bg-purple-100 text-purple-800',
        [STATUS.PENDING_CONFIRMATION]: 'bg-indigo-100 text-indigo-800',
        [STATUS.COMPLETED]: 'bg-green-100 text-green-800',
        [STATUS.DISPUTED]: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
        [STATUS.PENDING_DEPOSIT]: 'Pendiente de Depósito',
        [STATUS.FUNDS_SECURED]: 'Fondos Asegurados',
        [STATUS.PENDING_DELIVERY]: 'Pendiente de Entrega',
        [STATUS.PENDING_CONFIRMATION]: 'Pendiente de Confirmación',
        [STATUS.COMPLETED]: 'Completado',
        [STATUS.DISPUTED]: 'En Disputa'
    };

    return `<span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}">${statusLabels[status]}</span>`;
}

function renderBuyerDashboard() {
    const userAgreements = agreements.filter(a => a.buyerId === currentUser.id);
    const activeAgreements = userAgreements.filter(a => a.status !== STATUS.COMPLETED);
    const completedAgreements = userAgreements.filter(a => a.status === STATUS.COMPLETED);

    return `
        <div class="max-w-6xl mx-auto mt-10 p-6">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-2xl font-bold">Bienvenido, ${currentUser.name}</h2>
                <button onclick="navigateTo('/create-agreement')"
                        class="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                    Crear Nuevo Acuerdo
                </button>
            </div>

            <!-- Active Agreements -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 class="text-xl font-bold mb-4">Acuerdos Activos</h3>
                ${activeAgreements.length === 0 ? 
                    '<p class="text-gray-500">No hay acuerdos activos</p>' :
                    `<div class="space-y-4">
                        ${activeAgreements.map(agreement => `
                            <div class="border rounded-lg p-4">
                                <div class="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 class="font-bold">Acuerdo #${agreement.id}</h4>
                                        <p class="text-gray-600">Vendedor: ${agreement.sellerEmail}</p>
                                    </div>
                                    ${getStatusBadge(agreement.status)}
                                </div>
                                <div class="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p class="text-gray-600">Monto</p>
                                        <p class="font-bold">MXN ${agreement.amount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p class="text-gray-600">Fecha Límite</p>
                                        <p class="font-bold">${agreement.deadline.toLocaleDateString()}</p>
                                    </div>
                                </div>
                                ${renderAgreementActions(agreement)}
                            </div>
                        `).join('')}
                    </div>`
                }
            </div>

            <!-- Completed Agreements -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold mb-4">Historial</h3>
                ${completedAgreements.length === 0 ? 
                    '<p class="text-gray-500">No hay acuerdos completados</p>' :
                    `<div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead>
                                <tr class="border-b">
                                    <th class="text-left py-2">ID</th>
                                    <th class="text-left py-2">Vendedor</th>
                                    <th class="text-left py-2">Monto</th>
                                    <th class="text-left py-2">Fecha</th>
                                    <th class="text-left py-2">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${completedAgreements.map(agreement => `
                                    <tr class="border-b">
                                        <td class="py-2">#${agreement.id}</td>
                                        <td class="py-2">${agreement.sellerEmail}</td>
                                        <td class="py-2">MXN ${agreement.amount.toFixed(2)}</td>
                                        <td class="py-2">${agreement.created.toLocaleDateString()}</td>
                                        <td class="py-2">${getStatusBadge(agreement.status)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>`
                }
            </div>
        </div>
    `;
}
}

// Event listeners initialization
function initializePageListeners(page) {
    switch(page) {
        case 'login':
            document.getElementById('login-form')?.addEventListener('submit', handleLogin);
            break;
        case 'register':
            const registerForm = document.getElementById('register-form');
            registerForm?.addEventListener('submit', handleRegister);
            const roleSelect = registerForm?.querySelector('[name="role"]');
            roleSelect?.addEventListener('change', toggleSellerFields);
            break;
    }
}

// Form handlers
function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        navigateTo(user.role === 'buyer' ? '/buyer-dashboard' : '/seller-dashboard');
    } else {
        alert('Credenciales inválidas');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };

    // In a real app, we would validate and hash the password
    users.push(userData);
    alert('Registro exitoso');
    navigateTo('/login');
}

function toggleSellerFields(e) {
    const sellerFields = document.getElementById('seller-fields');
    if (sellerFields) {
        sellerFields.classList.toggle('hidden', e.target.value !== 'seller');
    }
}

// Initialize the app
window.addEventListener('popstate', () => {
    renderPage(window.location.pathname);
});

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    renderPage(window.location.pathname);
});
