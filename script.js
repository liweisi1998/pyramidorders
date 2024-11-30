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
        
        // 绑定 this
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        
        // 初始化事件监听
        this.initEvents();
        
        // 创建并添加提示元素
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'slider-tooltip';
        this.track.appendChild(this.tooltip);
        
        // 初始化显示
        this.updateDisplay(0);
    }

    initEvents() {
        // 鼠标事件
        this.track.addEventListener('mousedown', (e) => {
            this.onMouseDown(e);
        });

        this.thumb.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
            e.stopPropagation();
        });

        // 触摸事件 - 添加 passive 选项
        this.track.addEventListener('touchstart', (e) => {
            this.onTouchStart(e);
        }, { passive: true });

        this.thumb.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            document.addEventListener('touchmove', this.onTouchMove, { passive: false });
            document.addEventListener('touchend', this.onTouchEnd);
            e.stopPropagation();
        }, { passive: true });
    }

    onMouseDown(e) {
        const value = this.calculateValue(e.clientX);
        this.updateDisplay(value);
        this.tooltip.classList.add('active');
    }

    onTouchStart(e) {
        const touch = e.touches[0];
        const value = this.calculateValue(touch.clientX);
        this.updateDisplay(value);
        this.tooltip.classList.add('active');
    }

    onMouseMove(e) {
        if (!this.isDragging) return;
        const value = this.calculateValue(e.clientX);
        this.updateDisplay(value);
    }

    onTouchMove(e) {
        if (!this.isDragging) return;
        const touch = e.touches[0];
        const value = this.calculateValue(touch.clientX);
        this.updateDisplay(value);
        e.preventDefault();  // 防止页面滚动
    }

    onMouseUp() {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        this.tooltip.classList.remove('active');
    }

    onTouchEnd() {
        this.isDragging = false;
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
        this.tooltip.classList.remove('active');
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
        // 确保值在范围内
        value = Math.max(this.min, Math.min(this.max, value));
        
        // 计算百分比
        const percentage = ((value - this.min) / (this.max - this.min)) * 100;
        
        // 新滑块和进度条位置
        this.thumb.style.left = `${percentage}%`;
        this.progress.style.width = `${percentage}%`;
        
        // 更新显示的值
        const formattedValue = value.toFixed(2);
        if (this.valueDisplay) {
            this.valueDisplay.textContent = formattedValue;
        }
        
        // 更新提示内容
        this.tooltip.textContent =  value.toFixed(2);
        
        // 更新提示位置
        this.tooltip.style.left = `${percentage}%`;
        
        // 如果正在拖动，显示提示
        if (this.isDragging) {
            this.tooltip.classList.add('active');
        }
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
        const barContainer = e.target.closest('.order-bar-container');
        
        let clickedElement = null;
        let textToCopy = '';

        if (priceElement) {
            clickedElement = priceElement;
            textToCopy = priceElement.textContent.trim();
        } else if (barContainer) {
            clickedElement = barContainer;
            // 从 amount-display 中获取数字
            const amountDisplay = barContainer.querySelector('.amount-display');
            textToCopy = amountDisplay.textContent.trim();
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
    console.log('倒金字塔算开始:', {currentPrice, totalQuantity, orderCount, multiplier, maxPrice});
    
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
    
    // 从输入框值中提取当前价格
    const inputValue = document.getElementById('current-price').value;
    const currentPrice = parseFloat(inputValue.split(' ')[1]); // 获取价格部分
    
    // 计算平均价格和总量
    const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);
    const averagePrice = orders.reduce((sum, order) => sum + (order.price * order.amount), 0) / totalAmount;
    
    console.log('价格分析:', {
        当前价格: currentPrice,
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
    const multiplier = parseFloat(document.getElementById('multiplier-value').textContent);

    displayOrders.forEach((order, index) => {
        // 确保使用正确的当前价格计算涨跌幅
        const percentageChange = mode === 'pyramid' 
            ? ((currentPrice - order.price) / currentPrice * 100).toFixed(2)
            : ((order.price - currentPrice) / currentPrice * 100).toFixed(2);
        
            const orderHTML = `
            <div class="order-item">
                <div class="order-info">
                    <span class="price-value">${order.price.toFixed(2)}</span>
                    <span class="${mode === 'pyramid' ? 'percentage-down' : 'percentage-up'}">
                        ${mode === 'pyramid' ? '-' : '+'}${Math.abs(percentageChange)}%
                    </span>
                </div>
                <div class="order-bar-container">
                    <div class="order-bar" style="width: ${(order.amount / maxAmount) * 100}%"></div>
                    <div class="amount-display">${order.amount.toFixed(mode === 'pyramid' ? 2 : 8)}</div>
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
        investmentLabel.textContent = '入金额';
        priceLabel.textContent = '最低接货价格';
        priceInput.value = '90000';
    } else {
        investmentLabel.textContent = '投入数量';
        priceLabel.textContent = '最高卖出价格';
        priceInput.value = '100000';
    }
}

// 添加错误提示元素的创建函数
function createErrorMessage() {
    const errorSpan = document.createElement('span');
    errorSpan.id = 'price-error-message';
    errorSpan.style.color = '#ff4d4f';
    errorSpan.style.fontSize = '12px';
    errorSpan.style.marginLeft = '8px';
    
    // 将错误信息添加到价格输入框的父元素中
    const priceInput = document.getElementById('price-input');
    priceInput.parentElement.appendChild(errorSpan);
    return errorSpan;
}

// 重置错误状态函数
function resetErrorState(input, errorMessage) {
    console.log('重置错误状态:', {
        inputExists: !!input,
        errorMessageExists: !!errorMessage
    });

    if (input) {
        input.classList.remove('error');
        input.style.borderColor = '#d9d9d9';
        input.style.backgroundColor = '#fff';
        input.style.boxShadow = 'none';
    }

    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

// 价格验证函数
function validatePriceInput() {
    console.log('开始验证价格输入');
    
    const currentPriceInput = document.getElementById('current-price');
    const priceInput = document.getElementById('price-input');
    
    // 添加元素存在性检查
    if (!currentPriceInput || !priceInput) {
        console.log('验证价格: 找不到必要的输入元素', {
            currentPriceInput: !!currentPriceInput,
            priceInput: !!priceInput
        });
        return false;
    }

    let errorMessage = document.getElementById('price-error-message');
    
    // 如果错误提示元素不存在，创建它
    if (!errorMessage) {
        errorMessage = createErrorMessage();
    }
    
    // 重置错误状态
    resetErrorState(priceInput, errorMessage);
    
    // 如果没有输入值，不显示错误
    if (!currentPriceInput.value || !priceInput.value) {
        console.log('输入值为空，跳过验证');
        return true;
    }

    // 获取当前选择的模式
    const modeInput = document.querySelector('input[name="mode"]:checked');
    console.log('当前选择的模式:', {
        modeExists: !!modeInput,
        modeValue: modeInput?.value
    });

    // 如果没有选择模式，默认使用正金字塔模式
    const mode = modeInput ? modeInput.value : 'pyramid';
    console.log('使用的模式:', mode);

    // 安全地解析价格
    let currentPrice, inputPrice;
    try {
        currentPrice = currentPriceInput.value.includes(' ') ? 
            parseFloat(currentPriceInput.value.split(' ')[1]) : 
            parseFloat(currentPriceInput.value);
        inputPrice = parseFloat(priceInput.value);
        
        console.log('解析的价格:', {
            currentPrice,
            inputPrice
        });
    } catch (error) {
        console.log('价格解析错误:', error);
        return true;
    }
    
    // 如果价格无效，不显示错误
    if (isNaN(currentPrice) || isNaN(inputPrice)) {
        console.log('价格无效');
        return true;
    }

    // 验证价格逻辑
    if (mode === 'pyramid' && inputPrice > currentPrice) {
        console.log('正金字塔模式: 输入价格过大');
        showError(priceInput, errorMessage, '输入价格过大');
        return false;
    } else if (mode === 'reverse-pyramid' && inputPrice < currentPrice) {
        console.log('倒金字塔模式: 输入价格过低');
        showError(priceInput, errorMessage, '输入价格过低');
        return false;
    }

    console.log('价格验证通过');
    return true;
}

// 显示错误状态
function showError(input, errorMessage, text) {
    console.log('显示错误状态:', {
        inputExists: !!input,
        errorMessageExists: !!errorMessage,
        text: text
    });

    if (input) {
        input.classList.add('error');
        input.style.borderColor = '#ff4d4f';
        input.style.backgroundColor = '#fff2f0';
        input.style.boxShadow = '0 0 0 2px rgba(255, 77, 79, 0.2)';
    }

    if (errorMessage) {
        // 修正错误提示文本
        const errorTexts = {
            'price_too_high': '输入价格过大',
            'price_too_low': '输入价格过低'
        };
        
        errorMessage.textContent = errorTexts[text] || text;
        errorMessage.style.display = 'inline';
    }
}

// 修改计算按钮的事件处理
document.getElementById('calculate-button').addEventListener('click', () => {
    // 1. 获取并验证当前价格
    const currentPriceInput = document.getElementById('current-price').value;
    if (!currentPriceInput) {
        return;
    }
    
    const currentPrice = parseFloat(currentPriceInput.split(' ')[1]);
    if (isNaN(currentPrice)) {
        return;
    }

    // 2. 验证价格输入
    if (!validatePriceInput()) {
        return; // 如果验证失败，不执行计算
    }

    // ... 其余计算逻辑保持不变 ...
});

// 添加价格输入框的实时验证
document.getElementById('price-input').addEventListener('input', validatePriceInput);

// 添加模式切换时的验证
document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', validatePriceInput);
});

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
        // 1. 获取并验证当前价格
        const currentPriceInput = document.getElementById('current-price').value;
        if (!currentPriceInput) {
            alert('请先选择币种');
            return;
        }
        
        // 从输入值中提取价格 (格式: "BTC/USDT 45000")
        const currentPrice = parseFloat(currentPriceInput.split(' ')[1]);
        if (isNaN(currentPrice)) {
            alert('币种价格无效');
            return;
        }

        // 2. 获取其他输入值
        const orderCount = parseInt(document.getElementById('order-quantity').value);
        const multiplier = slider.getValue();
        const minPrice = parseFloat(document.getElementById('price-input').value);

        // 3. 验证最低/最高价格
        if (currentMode === 'pyramid' && minPrice > currentPrice) {
            alert('最低接货价不能高于当前价格');
            return;
        } else if (currentMode === 'reverse-pyramid' && minPrice < currentPrice) {
            alert('最高卖货价不能低于当前价格');
            return;
        }

        // 4. 执行计算
        let orders;
        if (currentMode === 'pyramid') {
            const amount = parseFloat(document.getElementById('investment-amount').value);
            orders = calculatePyramidOrders(currentPrice, amount, orderCount, multiplier, minPrice);
        } else {
            const quantity = parseFloat(document.getElementById('investment-amount').value);
            orders = calculateReversePyramidOrders(currentPrice, quantity, orderCount, multiplier, minPrice);
        }

        // 5. 显示结果
        if (orders) {
            displayResults(orders, currentMode);
        }
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
                    波动围: variation,
                    实际波动: randomDelta,
                    新价格: newPrice
                });
            }
        });
    }

    // 在文件开头声明这些变量（只声明一次）
    const shortcutAmounts = document.querySelectorAll('.shortcut-amount');
    const investmentInput = document.getElementById('investment-amount');
    const orderQuantityInput = document.getElementById('order-quantity');

    // 验证输入
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
            const isValid = /^\d+$/.test(value);
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

    // 快捷金额点击事件处
    shortcutAmounts.forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseFloat(btn.dataset.amount);
            
            // 根据父元素确定要更新哪个输入框
            const parentLabel = btn.closest('.input-label-group');
            const isOrderQuantity = parentLabel.textContent.includes('挂单数量');
            const targetInput = isOrderQuantity ? orderQuantityInput : investmentInput;
            
            // 设置新值
            targetInput.value = amount;
            
            // 添加点击反馈效果
            btn.style.opacity = '0.5';
            setTimeout(() => {
                btn.style.opacity = '1';
            }, 100);
            
            // 触发 input 事件
            targetInput.dispatchEvent(new Event('input'));
        });
    });

    const coinSelector = new CoinSelector();
    
    // 注册价格变化的回调函数
    coinSelector.onPriceChange((price) => {
        // 确保价格是有效数
        if (!isNaN(price) && price > 0) {
            this.onPriceChangeCallbacks.forEach(callback => callback(price));
            
            // 选择新币种后，验证最低/最高价格
            const priceInput = document.getElementById('price-input');
            const inputPrice = parseFloat(priceInput.value);
            
            if (!isNaN(inputPrice)) {
                const mode = document.querySelector('input[name="mode"]:checked').value;
                if (mode === 'pyramid' && inputPrice > price) {
                    priceInput.style.borderColor = '#ff4d4f';
                    alert('最低接���价不能高于当前价格');
                } else if (mode === 'reverse-pyramid' && inputPrice < price) {
                    priceInput.style.borderColor = '#ff4d4f';
                    alert('最高卖货价不能低于前价格');
                } else {
                    priceInput.style.borderColor = '#d9d9d9';
                }
            }
        }
    });

    function validatePriceInput() {
        const currentPriceInput = document.getElementById('current-price').value;
        const priceInput = document.getElementById('price-input');
        const inputPrice = parseFloat(priceInput.value);
        
        if (!currentPriceInput || !priceInput.value) {
            return true; // 如果输入为空，不显示错误
        }

        const currentPrice = parseFloat(currentPriceInput.split(' ')[1]);
        if (isNaN(currentPrice) || isNaN(inputPrice)) {
            return true; // 如果价格无效，不显示错误
        }

        const mode = document.querySelector('input[name="mode"]:checked').value;
        
        if (mode === 'pyramid' && inputPrice > currentPrice) {
            priceInput.style.borderColor = '#ff4d4f';
            return false;
        } else if (mode === 'reverse-pyramid' && inputPrice < currentPrice) {
            priceInput.style.borderColor = '#ff4d4f';
            return false;
        }

        priceInput.style.borderColor = '#d9d9d9';
        return true;
    }

    // 添加事件监听
    document.addEventListener('DOMContentLoaded', () => {
        const priceInput = document.getElementById('price-input');
        const modeInputs = document.querySelectorAll('input[name="mode"]');
        
        // 监听价格输入变化
        priceInput.addEventListener('input', validatePriceInput);
        
        // 监听模式切换
        modeInputs.forEach(input => {
            input.addEventListener('change', validatePriceInput);
        });
    });
});

class CoinSelector {
    constructor() {
        this.currentPriceInput = document.getElementById('current-price');
        this.coins = [];
        this.searchHistory = this.loadSearchHistory();
        
        // 修改输入框的 placeholder
        this.currentPriceInput.placeholder = '选择或输入币种';
        this.currentPriceInput.value = '';
        
        this.lastSelectedValue = ''; // 保存上次选择的值
        this.isSelecting = false; // 添加标记，表示是否正在选择中
        
        // 热门币种列表
        this.popularCoins = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOGE/USDT', 'XRP/USDT'];
        
        // 创建并添加提示元素
        this.dropdown = this.createDropdown();
        
        // 初始化事件监听
        this.initEvents();
        
        // 初始化币种数据
        this.initCoinsData();
        this.onPriceChangeCallbacks = []; // 在构造函数中初始化回调数组
    }

    async initCoinsData() {
        try {
            console.log('开始获取币种数据');
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1');
            const data = await response.json();
            
            this.coins = data.map(coin => ({
                symbol: `${coin.symbol.toUpperCase()}/USDT`,
                name: coin.name,
                rank: coin.market_cap_rank,
                price: coin.current_price
            }));
            
            console.log('币种数据加载完成:', {
                总数: this.coins.length,
                示例: this.coins.slice(0, 3)
            });
        } catch (error) {
            console.error('获取币种数据失败:', error);
        }
    }

    createDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'coin-dropdown';
        dropdown.style.display = 'none';
        // 将下拉框加到输入框的父元中
        this.currentPriceInput.parentElement.style.position = 'relative';
        this.currentPriceInput.parentElement.appendChild(dropdown);
        return dropdown;
    }

    loadSearchHistory() {
        const history = localStorage.getItem('coinSearchHistory');
        return history ? JSON.parse(history) : [];
    }

    saveSearchHistory(coin) {
        this.searchHistory = [coin, ...this.searchHistory.filter(item => item !== coin)].slice(0, 5);
        localStorage.setItem('coinSearchHistory', JSON.stringify(this.searchHistory));
    }

    showDropdown() {
        console.log('显示下拉列表');
        this.updateDropdownContent();
        this.dropdown.style.display = 'block';
    }

    updateDropdownContent() {
        let html = '<div class="dropdown-section">';
        html += '<div class="section-title">热门币种</div>';
        this.popularCoins.forEach(symbol => {
            const coin = this.coins.find(c => c.symbol === symbol);
            if (coin) {
                html += this.createCoinItem(coin);
            }
        });
        
        if (this.searchHistory.length > 0) {
            html += '<div class="section-title">最近搜索</div>';
            this.searchHistory.forEach(symbol => {
                const coin = this.coins.find(c => c.symbol === symbol);
                if (coin) {
                    html += this.createCoinItem(coin);
                }
            });
        }
        
        html += '</div>';
        this.dropdown.innerHTML = html;
    }

    createCoinItem(coin) {
        return `
            <div class="coin-item" data-symbol="${coin.symbol}">
                <div class="coin-info">
                    <span class="coin-symbol">${coin.symbol}</span>
                    <span class="coin-price">${coin.price}</span>
                </div>
            </div>
        `;
    }

    filterCoins(searchText) {
        if (!searchText) {
            this.updateDropdownContent();
            return;
        }

        const filteredCoins = this.coins.filter(coin => 
            coin.symbol.includes(searchText) || 
            coin.name.toUpperCase().includes(searchText)
        );

        let content = '';
        if (filteredCoins.length > 0) {
            content = filteredCoins.map(coin => this.createCoinItem(coin)).join('');
        } else {
            content = '<div class="no-results">目前不支持这个币种</div>';
        }
        
        this.dropdown.innerHTML = content;
    }

    initEvents() {
        // 输入框点击和输入事件
        this.currentPriceInput.addEventListener('click', () => {
            console.log('输入框被点击');
            this.isSelecting = true;
            this.showDropdown();
        });

        // 添加输入事件处理
        this.currentPriceInput.addEventListener('input', (e) => {
            const searchText = e.target.value.toUpperCase();
            this.filterCoins(searchText);
            this.showDropdown();
        });

        // 修改选择币种事件
         this.dropdown.addEventListener('click', (e) => {
        const coinItem = e.target.closest('.coin-item');
        if (coinItem) {
            const symbol = coinItem.dataset.symbol;
            const coin = this.coins.find(c => c.symbol === symbol);
            if (coin) {
                console.log('选择币种:', coin);
                
                // 更新输入框显示（显示币种和价格）
                this.currentPriceInput.value = `${coin.symbol} ${coin.price}`;
                this.lastSelectedValue = this.currentPriceInput.value;
                
                // 保存搜索历史
                this.saveSearchHistory(coin.symbol);
                
                // 隐藏下拉框
                this.dropdown.style.display = 'none';
                this.isSelecting = false;
                
                // 触发价格更新
                this.notifyPriceChange(coin.price);
            }
        }
    });

        // 修改点击其他区域的处理
        document.addEventListener('click', (e) => {
            if (!this.currentPriceInput.contains(e.target) && 
                !this.dropdown.contains(e.target)) {
                this.dropdown.style.display = 'none';
                // 如果有上次选择的值，恢复它
                if (this.lastSelectedValue) {
                    this.currentPriceInput.value = this.lastSelectedValue;
                }
            }
        });
    }

    // 修改价格变化回调的注册方法
    onPriceChange(callback) {
        if (typeof callback === 'function') {
            this.onPriceChangeCallbacks.push(callback);
            console.log('添加价格更新回调, 当前回调数量:', this.onPriceChangeCallbacks.length);
        }
    }

    // 修改触发价格更新的方法
    notifyPriceChange(price) {
        console.log('触发价格更新:', {
            price: price,
            回调数量: this.onPriceChangeCallbacks.length
        });

        this.onPriceChangeCallbacks.forEach(callback => {
            try {
                callback(price);
                console.log('价格更新回调执行成功:', price);
            } catch (error) {
                console.error('执行价格更新回调时出错:', error);
            }
        });
    }

    // 更新下拉列表内容
    updateDropdownContent(coinsToShow = this.coins) {
        const recentCoins = this.getRecentCoins();
        let content = '';

        // 添加最近选择的币种
        if (recentCoins.length > 0) {
            content += '<div class="dropdown-section"><div class="section-title">最近选择</div>';
            recentCoins.forEach(symbol => {
                const coin = this.coins.find(c => c.symbol === symbol);
                if (coin) {
                    content += this.createCoinItem(coin);
                }
            });
            content += '</div>';
        }

        // 添加热门币种
        content += '<div class="dropdown-section"><div class="section-title">所有币种</div>';
        coinsToShow.forEach(coin => {
            content += this.createCoinItem(coin);
        });
        content += '</div>';

        this.dropdown.innerHTML = content;
    }

    // 在 CoinSelector 类中添加这个方法
    getRecentCoins() {
        return this.searchHistory || [];
    }
}

// 修改文档加载完成后的回调注册
document.addEventListener('DOMContentLoaded', () => {
    const coinSelector = new CoinSelector();
    
    coinSelector.onPriceChange((price) => {
        console.log('价格更新回调被触发:', price);
        validatePriceInput();
    });
});

