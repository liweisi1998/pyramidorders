// 首先定义 Slider 类
class Slider {
    constructor() {
        this.track = document.querySelector('.slider-track');
        this.progress = document.querySelector('.slider-progress');
        this.thumb = document.querySelector('.slider-thumb');
        this.valueDisplay = document.getElementById('multiplier-value');
        
        this.min = 0;
        this.max = 2;
        this.step = 0.05;
        
        this.isDragging = false;
        
        this.init();
    }

    init() {
        // 绑定 this
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        
        // 鼠标事件
        this.thumb.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        });
        
        // 触摸事件
        this.thumb.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            document.addEventListener('touchmove', this.onTouchMove);
            document.addEventListener('touchend', this.onTouchEnd);
            // 防止页面滚动
            e.preventDefault();
        }, { passive: false });
        
        // 点击轨道
        this.track.addEventListener('click', (e) => {
            if (e.target === this.thumb) return;
            const value = this.calculateValue(e.clientX);
            this.updateDisplay(value);
        });
        
        // 触摸轨道
        this.track.addEventListener('touchstart', (e) => {
            if (e.target === this.thumb) return;
            const touch = e.touches[0];
            const value = this.calculateValue(touch.clientX);
            this.updateDisplay(value);
            e.preventDefault();
        }, { passive: false });
        
        this.updateDisplay(0);
    }

    onTouchMove(e) {
        if (!this.isDragging) return;
        const touch = e.touches[0];
        const value = this.calculateValue(touch.clientX);
        this.updateDisplay(value);
        // 防止页面滚动
        e.preventDefault();
    }

    onTouchEnd() {
        this.isDragging = false;
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
    }

    onMouseMove(e) {
        if (!this.isDragging) return;
        const value = this.calculateValue(e.clientX);
        this.updateDisplay(value);
    }

    onMouseUp() {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    calculateValue(clientX) {
        const rect = this.track.getBoundingClientRect();
        const percentage = (clientX - rect.left) / rect.width;
        const range = this.max - this.min;
        let value = this.min + (range * percentage);
        value = Math.max(this.min, Math.min(this.max, value));
        value = Math.round(value / this.step) * this.step;
        return value;
    }

    updateDisplay(value) {
        const percentage = ((value - this.min) / (this.max - this.min)) * 100;
        this.thumb.style.left = `${percentage}%`;
        this.progress.style.width = `${percentage}%`;
        this.valueDisplay.textContent = value.toFixed(2);
    }

    getValue() {
        return parseFloat(this.valueDisplay.textContent);
    }
}

// 修改复制提示样式
const style = document.createElement('style');
style.textContent = `
    .copy-tooltip {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.06);
        color: rgba(0, 0, 0, 0.65);
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        pointer-events: none;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.2s;
        transform: translateY(-10px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .copy-tooltip.show {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// 添加复制功能
function addCopyFeature() {
    const orderSummary = document.getElementById('order-summary');
    let tooltip = null;

    function createTooltip() {
        const tip = document.createElement('div');
        tip.className = 'copy-tooltip';
        document.body.appendChild(tip);
        return tip;
    }

    function showTooltip(text) {
        if (!tooltip) {
            tooltip = createTooltip();
        }
        tooltip.textContent = `已复制 ${text}`;
        tooltip.classList.add('show');

        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 2000);
    }

    orderSummary.addEventListener('click', (e) => {
        const priceElement = e.target.closest('.price-value');
        const amountElement = e.target.closest('.order-bar');
        
        let clickedElement = null;
        let textToCopy = '';

        if (priceElement) {
            clickedElement = priceElement;
            textToCopy = priceElement.textContent.trim();
        } else if (amountElement) {
            clickedElement = amountElement;
            textToCopy = amountElement.textContent.trim();
        }

        if (textToCopy) {
            // 添加点击状态样式
            clickedElement.classList.add('clicked');
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                showTooltip(textToCopy);
            });
        }
    });
}

// 计算函数
function calculatePyramidOrders(currentPrice, totalAmount, orderCount, multiplier, minPrice) {
    console.log('正金字塔计算开始:', {currentPrice, totalAmount, orderCount, multiplier, minPrice});
    
    const orders = [];
    const priceStep = (currentPrice - minPrice) / (orderCount - 1);
    const baseAmount = totalAmount / orderCount;
    let totalInvestment = 0;

    for (let i = 0; i < orderCount; i++) {
        const orderPrice = currentPrice - (priceStep * i);
        const orderAmount = baseAmount * (1 + multiplier * i);
        totalInvestment += orderAmount;
        
        orders.push({
            price: orderPrice,
            amount: orderAmount
        });
    }

    const adjustmentFactor = totalAmount / totalInvestment;
    orders.forEach(order => {
        order.amount *= adjustmentFactor;
    });

    return orders;
}

function calculateReversePyramidOrders(currentPrice, totalQuantity, orderCount, multiplier, maxPrice) {
    console.log('倒金字塔计算开始:', {currentPrice, totalQuantity, orderCount, multiplier, maxPrice});
    
    const orders = [];
    const priceStep = (maxPrice - currentPrice) / (orderCount - 1);
    const baseQuantity = totalQuantity / orderCount;
    let totalQuantitySum = 0;

    for (let i = 0; i < orderCount; i++) {
        const orderPrice = currentPrice + (priceStep * i);
        const orderQuantity = baseQuantity * (1 + multiplier * i);
        totalQuantitySum += orderQuantity;
        
        orders.push({
            price: orderPrice,
            amount: orderQuantity
        });
    }

    const adjustmentFactor = totalQuantity / totalQuantitySum;
    orders.forEach(order => {
        order.amount *= adjustmentFactor;
    });

    return orders;
}

function displayResults(orders, mode) {
    console.log('开始显示结果:', {mode, ordersCount: orders.length});
    console.log('排序前订单:', orders);
    
    // 计算平均价格和总量
    const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);
    const averagePrice = orders.reduce((sum, order) => sum + (order.price * order.amount), 0) / totalAmount;
    
    console.log('价格分析:', {
        订单价格: orders.map(o => o.price),
        平均价格: averagePrice,
    });

    // 找到平均价格应该插入的位置
    let insertIndex = -1;
    for (let i = 0; i < orders.length - 1; i++) {
        if (orders[i].price >= averagePrice && orders[i + 1].price <= averagePrice ||
            orders[i].price <= averagePrice && orders[i + 1].price >= averagePrice) {
            insertIndex = i + 1;
            console.log('找到平均价格插入位置:', {
                上方价格: orders[i].price,
                平均价格: averagePrice,
                下方价格: orders[i + 1].price,
                插入位置: insertIndex
            });
            break;
        }
    }
    
    const orderSummary = document.getElementById('order-summary');
    orderSummary.innerHTML = '<h3>订单分布</h3>';

    let displayOrders = [...orders];
    if (mode === 'reverse-pyramid') {
        displayOrders.reverse();
    }
    
    console.log('排序后订单:', displayOrders);

    const maxAmount = Math.max(...displayOrders.map(order => order.amount));
    const currentPrice = parseFloat(document.getElementById('current-price').value);
    const multiplier = parseFloat(document.getElementById('multiplier-value').textContent);

    displayOrders.forEach((order, index) => {
        const percentageChange = mode === 'pyramid' 
            ? ((currentPrice - order.price) / currentPrice * 100).toFixed(2)
            : ((order.price - currentPrice) / currentPrice * 100).toFixed(2);
        
        const orderHTML = `
            <div class="order-item">
                <div class="order-info">
                    <span class="price-value">${order.price.toFixed(2)}</span>
                    <span class="${mode === 'pyramid' ? 'percentage-down' : 'percentage-up'}">
                        ${mode === 'pyramid' ? '-' : '+'}${percentageChange}%
                    </span>
                </div>
                <div class="order-bar-container">
                    <div class="order-bar" style="width: ${(order.amount / maxAmount) * 100}%">
                        ${order.amount.toFixed(mode === 'pyramid' ? 2 : 8)}
                    </div>
                </div>
            </div>
        `;
        orderSummary.innerHTML += orderHTML;

        if (index === insertIndex) {
            const avgPriceHTML = `
                <div class="average-price-line">
                    <div class="line"></div>
                    <div class="price">${averagePrice.toFixed(2)}</div>
                </div>
            `;
            orderSummary.innerHTML += avgPriceHTML;
        }
    });

    const summaryHTML = `
        <div class="orders-summary">
            <div class="summary-item">目前挂单: <span>${displayOrders.length}个</span></div>
            <div class="summary-item">投入${mode === 'pyramid' ? '金额' : '数量'}总计: <span>${totalAmount.toFixed(mode === 'pyramid' ? 2 : 8)}</span></div>
            <div class="summary-item">投入倍数: <span>${multiplier}</span></div>
            <div class="summary-item">平均${mode === 'pyramid' ? '持仓' : '卖出'}价格: <span>${averagePrice.toFixed(2)}</span></div>
        </div>
    `;
    orderSummary.innerHTML += summaryHTML;

    addCopyFeature();
}

// 设置默认值函数
function setDefaultValues() {
    document.getElementById('current-price').value = '95000';
    document.getElementById('investment-amount').value = '1';
    document.getElementById('order-quantity').value = '5';
    
    const mode = document.querySelector('.mode-btn.active').dataset.mode;
    const priceInput = document.getElementById('price-input');
    priceInput.value = mode === 'pyramid' ? '90000' : '100000';
}

// 更新模式标签函数
function updateModeLabels(mode) {
    const investmentLabel = document.querySelector('label[for="investment-amount"]');
    const priceLabel = document.querySelector('label[for="price-input"]');
    const priceInput = document.getElementById('price-input');
    
    if (mode === 'pyramid') {
        investmentLabel.textContent = '投入金额';
        priceLabel.textContent = '最低接货价格';
        priceInput.value = '90000';
    } else {
        investmentLabel.textContent = '投入数量';
        priceLabel.textContent = '最高卖出价格';
        priceInput.value = '100000';
    }
}

// 文档加载完成后的初始化代码
document.addEventListener('DOMContentLoaded', () => {
    const slider = new Slider();
    setDefaultValues();
    
    const calculateButton = document.getElementById('calculate-button');
    const orderSummary = document.getElementById('order-summary');
    const modeButtons = document.querySelectorAll('.mode-btn');
    let currentMode = 'pyramid';

    modeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            modeButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentMode = e.target.dataset.mode;
            updateModeLabels(currentMode);
            setDefaultValues();
        });
    });

    calculateButton.addEventListener('click', () => {
        const currentPrice = parseFloat(document.getElementById('current-price').value);
        const orderCount = parseInt(document.getElementById('order-quantity').value);
        const multiplier = slider.getValue();
        const priceInput = document.getElementById('price-input');

        let orders;
        if (currentMode === 'pyramid') {
            const amount = parseFloat(document.getElementById('investment-amount').value);
            orders = calculatePyramidOrders(currentPrice, amount, orderCount, multiplier, parseFloat(priceInput.value));
        } else {
            const quantity = parseFloat(document.getElementById('investment-amount').value);
            orders = calculateReversePyramidOrders(currentPrice, quantity, orderCount, multiplier, parseFloat(priceInput.value));
        }

        displayResults(orders, currentMode);

        if (window.innerWidth <= 768) {
            const resultOffset = calculateButton.offsetTop - 75;
            window.scrollTo({
                top: resultOffset,
                behavior: 'smooth'
            });
        }
    //     const multiplierSection = document.querySelector('.multiplier-label');  // 或者用其他合适的选择器
    // if (multiplierSection) {
    //     const offset = multiplierSection.offsetTop - 50;  // 20px 的上边距
    //     window.scrollTo({
    //         top: offset,
    //         behavior: 'smooth'
    //     });
    // }
        

    });

    const backToTopBtn = document.querySelector('.back-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    const randomBtn = document.querySelector('.random-btn');
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            const priceInput = document.getElementById('price-input');
            const currentValue = parseFloat(priceInput.value);
            
            if (!isNaN(currentValue)) {
                const variation = currentValue * 0.00005;
                const randomDelta = (Math.random() * 2 - 1) * variation;
                const newPrice = currentValue + randomDelta;
                
                priceInput.value = newPrice.toFixed(2);
                
                console.log('随机波动:', {
                    原始价格: currentValue,
                    波动范围: variation,
                    实际波动: randomDelta,
                    新价格: newPrice
                });
            }
        });
    }

    const orderQuantityInput = document.getElementById('order-quantity');
if (orderQuantityInput) {
    // 创建提示元素
    const tipElement = document.createElement('div');
    tipElement.style.cssText = `
        color: #ff4d4f;
        font-size: 12px;
        margin-top: 4px;
        display: none;
    `;
    tipElement.textContent = '请输入整数';
    orderQuantityInput.parentNode.appendChild(tipElement);

    // 验证输入
    orderQuantityInput.addEventListener('input', function() {
        const value = this.value;
        const isValid = /^\d+$/.test(value); // 检查是否为整数
        
        // 显示或隐藏提示
        tipElement.style.display = isValid ? 'none' : 'block';
    });

    // 失去焦点时，如果为空则设为1
    orderQuantityInput.addEventListener('blur', function() {
        if (!this.value) {
            this.value = '1';
            tipElement.style.display = 'none';
        }
    });
}
});

