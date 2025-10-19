class FactoryForm {
    constructor() {
        this.form = null;
        this.successMessage = null;
        this.map = null;
        this.marker = null;
        this.geocoder = null;
        this.countryCodes = this.initializeCountryCodes();
        this.ownerIndex = 1;
        this.productionLineIndex = 1;
        
        this.currentLanguage = 'en';
        this.translations = {};
        this.languageSelector = null;
        
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.setupElements();
        this.setupEventListeners();
        this.setupCountryCityDropdown();
        this.setupGoogleMaps();
        this.detectAndSetLanguage();
        this.populateCountryCodeSelectors();
        this.loadFormData();
    }

    async loadTranslations() {
        try {
            // Load all translation files
            const [enTranslations, arTranslations, deTranslations, esTranslations, frTranslations, zhTranslations, ruTranslations, inTranslations, trTranslations] = await Promise.all([
                fetch('translations/en.json').then(res => res.json()),
                fetch('translations/ar.json').then(res => res.json()),
                fetch('translations/de.json').then(res => res.json()),
                fetch('translations/es.json').then(res => res.json()),
                fetch('translations/fr.json').then(res => res.json()),
                fetch('translations/zh.json').then(res => res.json()),
                fetch('translations/ru.json').then(res => res.json()),
                fetch('translations/in.json').then(res => res.json()),
                fetch('translations/tr.json').then(res => res.json()),
            ]);
            
            this.translations = {
                en: enTranslations,
                ar: arTranslations,
                de: deTranslations,
                es: esTranslations,
                fr: frTranslations,
                zh: zhTranslations,
                ru: ruTranslations,
                in: inTranslations,
                tr: trTranslations
            };
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to basic translations
            this.translations = {
                en: { error: 'Translation loading failed' },
                ar: { error: 'فشل في تحميل الترجمة' }
            };
        }
    }

    detectAndSetLanguage() {
        // Get browser language
        const browserLang = navigator.language || navigator.userLanguage;
        const primaryLang = browserLang.split('-')[0].toLowerCase();
        
        // Check if we support this language
        let detectedLang = 'en'; // default
        if (this.translations[primaryLang]) {
            detectedLang = primaryLang;
        } else if (primaryLang === 'ar' || browserLang.includes('ar')) {
            detectedLang = 'ar';
        } else if (primaryLang === 'de' || browserLang.includes('de')) {
            detectedLang = 'de';
        } else if (primaryLang === 'es' || browserLang.includes('es')) {
            detectedLang = 'es';
        } else if (primaryLang === 'fr' || browserLang.includes('fr')) {
            detectedLang = 'fr';
        } else if (primaryLang === 'zh' || browserLang.includes('zh')) {
            detectedLang = 'zh';
        } else if (primaryLang === 'ru' || browserLang.includes('ru')) {
            detectedLang = 'ru';
        } else if (primaryLang === 'in' || browserLang.includes('in')) {
            detectedLang = 'in';
        } else if (primaryLang === 'tr' || browserLang.includes('tr')) {
            detectedLang = 'tr';
        }
        
        // Set language
        this.setLanguage(detectedLang);
        
        // Update language selector
        this.updateCustomSelectorDisplay(detectedLang);
    }

    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`Language ${lang} not supported, falling back to English`);
            lang = 'en';
        }
        
        this.currentLanguage = lang;
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        // Update body direction for RTL languages
        if (lang === 'ar') {
            document.body.classList.add('rtl');
            // Fix RTL mobile visibility issues
            this.fixRTLMobileVisibility();
        } else {
            document.body.classList.remove('rtl');
        }
        
        // Apply translations
        this.applyTranslations();
        
        // Save language preference
        localStorage.setItem('preferredLanguage', lang);
    }

    applyTranslations() {
        // Translate all elements with data-translate attribute
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Translate placeholders
        const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            const translation = this.getTranslation(key);
            if (translation) {
                element.placeholder = translation;
            }
        });

        // Update country options
        this.updateCountryOptions();
        
        // Update city options if country is selected
        const countrySelect = document.getElementById('country');
        if (countrySelect && countrySelect.value) {
            this.handleCountryChange({ target: countrySelect });
        }
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return null; // Translation not found
            }
        }
        
        return value;
    }

    fixRTLMobileVisibility() {
        // Fix detailed address field
        const detailedAddress = document.getElementById('detailedAddress');
        if (detailedAddress) {
            detailedAddress.style.direction = 'rtl';
            detailedAddress.style.textAlign = 'right';
            detailedAddress.style.display = 'block';
            detailedAddress.style.width = '100%';
        }
        
        // Fix phone input fields
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.style.direction = 'rtl';
            input.style.textAlign = 'right';
        });
        
        // Fix phone input containers
        const phoneContainers = document.querySelectorAll('.phone-input-container');
        phoneContainers.forEach(container => {
            if (window.innerWidth <= 768) {
                container.style.flexDirection = 'column';
                container.style.gap = '8px';
            }
        });
        
        // Fix address container
        const addressContainer = document.querySelector('.address-container');
        if (addressContainer && window.innerWidth <= 768) {
            addressContainer.style.flexDirection = 'column';
        }
        
        // Fix address fields
        const addressFields = document.querySelector('.address-fields');
        if (addressFields) {
            addressFields.style.display = 'block';
            addressFields.style.width = '100%';
            addressFields.style.minWidth = '100%';
        }
        
        // Force reflow to ensure changes take effect
        document.body.offsetHeight;
    }

    updateCountryOptions() {
        const countrySelect = document.getElementById('country');
        if (!countrySelect) return;
        
        // Keep the current selection
        const currentValue = countrySelect.value;
        
        // Update country names based on current language
        Array.from(countrySelect.options).forEach(option => {
            if (option.value && option.value !== '') {
                const countryCode = option.value;
                const translation = this.getTranslation(`countries.${countryCode}`);
                if (translation) {
                    option.textContent = translation;
                }
            }
        });
        
        // Restore selection
        countrySelect.value = currentValue;
    }

    setupElements() {
        this.form = document.getElementById('factoryForm');
        this.successMessage = document.getElementById('successMessage');
        this.languageSelector = document.getElementById('languageSelector');
        
        if (!this.form) {
            console.error('Factory form not found');
            return;
        }
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Setup custom language selector
        this.setupCustomLanguageSelector();
        
        this.setupDynamicSections();
        this.setupRealTimeValidation();
        this.setupPhoneFormatting();
        this.setupAutoSave();
        this.setupResizeHandler();
    }

    /**
     * Setup custom language selector with flag icons
     */
    setupCustomLanguageSelector() {
        const customSelect = document.getElementById('customLanguageSelector');
        const hiddenSelect = document.getElementById('languageSelector');
        
        if (!customSelect || !hiddenSelect) {
            console.warn('Custom language selector elements not found');
            return;
        }
        
        const trigger = customSelect.querySelector('.select-trigger');
        const options = customSelect.querySelectorAll('.option');
        const selectedOption = customSelect.querySelector('.selected-option');
        
        // Flag icon mapping
        const flagMapping = {
            'auto': '<i class="fas fa-globe selected-flag-icon"></i>',
            'en': '<img src="icns/us.svg" alt="US Flag" class="flag-icon">',
            'tr': '<img src="icns/tr.svg" alt="Turkey Flag" class="flag-icon">',
            'ar': '<img src="icns/ar.svg" alt="Saudi Arabia Flag" class="flag-icon">',
            'de': '<img src="icns/de.svg" alt="Germany Flag" class="flag-icon">',
            'fr': '<img src="icns/fr.svg" alt="France Flag" class="flag-icon">',
            'es': '<img src="icns/es.svg" alt="Spain Flag" class="flag-icon">',
            'zh': '<img src="icns/cn.svg" alt="China Flag" class="flag-icon">',
            'ru': '<img src="icns/ru.svg" alt="Russia Flag" class="flag-icon">',
            'in': '<img src="icns/in.svg" alt="India Flag" class="flag-icon">'
        };
        
        // Language text mapping
        const languageMapping = {
            'auto': 'Auto',
            'en': 'English',
            'tr': 'Türkçe',
            'ar': 'العربية',
            'de': 'Deutsch',
            'fr': 'Français',
            'es': 'Español',
            'zh': '中文',
            'ru': 'Русский',
            'in': 'हिंदी'
        };
        
        // Toggle dropdown with portal behavior
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = customSelect.classList.toggle('open');
            if (isOpen) {
                this.openPortaledDropdown(customSelect);
            } else {
                this.closePortaledDropdown(customSelect);
            }
        });
        
        // Handle option selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const value = option.getAttribute('data-value');
                
                // Update visual selection
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // Update trigger display
                const flagIcon = flagMapping[value] || flagMapping['auto'];
                const languageText = languageMapping[value] || 'Auto';
                selectedOption.innerHTML = `${flagIcon} ${languageText}`;
                
                // Update hidden select
                hiddenSelect.value = value;
                
                // Trigger language change
                this.setLanguage(value);
                
                // Close dropdown
                customSelect.classList.remove('open');
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target)) {
                if (customSelect.classList.contains('open')) {
                    customSelect.classList.remove('open');
                    this.closePortaledDropdown(customSelect);
                }
            }
        });
        
        // Keyboard navigation support
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const isOpen = customSelect.classList.toggle('open');
                if (isOpen) {
                    this.openPortaledDropdown(customSelect);
                } else {
                    this.closePortaledDropdown(customSelect);
                }
            } else if (e.key === 'Escape') {
                if (customSelect.classList.contains('open')) {
                    customSelect.classList.remove('open');
                    this.closePortaledDropdown(customSelect);
                }
            }
        });
        
        // Set initial selection
        this.updateCustomSelectorDisplay('auto');
        
        // Store reference for later use
        this.customLanguageSelector = customSelect;
        this.languageSelector = hiddenSelect;
    }

    /**
     * Portal the language dropdown options to body and position it
     */
    openPortaledDropdown(customSelect) {
        const optionsEl = customSelect.querySelector('.select-options');
        const trigger = customSelect.querySelector('.select-trigger');
        if (!optionsEl || !trigger) return;

        // Save original parent for restoration
        optionsEl.__originalParent = optionsEl.parentNode;
        optionsEl.__originalNextSibling = optionsEl.nextSibling;

        // Compute trigger rect
        const rect = trigger.getBoundingClientRect();
        const width = rect.width;
        const top = rect.bottom;
        const left = rect.left;

        // Convert to fixed positioned popover
        optionsEl.classList.add('portaled');
        optionsEl.style.position = 'fixed';
        optionsEl.style.top = `${Math.round(top)}px`;
        optionsEl.style.left = `${Math.round(left)}px`;
        optionsEl.style.width = `${Math.round(width)}px`;
        optionsEl.style.display = 'block';
        optionsEl.style.zIndex = '2147483647';

        // Append to body to avoid clipping and stacking issues
        document.body.appendChild(optionsEl);

        // Bind listeners to keep position on scroll/resize
        const reposition = () => {
            const r = trigger.getBoundingClientRect();
            optionsEl.style.top = `${Math.round(r.bottom)}px`;
            optionsEl.style.left = `${Math.round(r.left)}px`;
            optionsEl.style.width = `${Math.round(r.width)}px`;
        };
        optionsEl.__repositionHandler = reposition;
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        // Initial position correction
        reposition();
    }

    /**
     * Restore the dropdown options back to original DOM and cleanup
     */
    closePortaledDropdown(customSelect) {
        const bodyOptions = document.querySelector('body > .select-options.portaled');
        const optionsEl = bodyOptions || customSelect.querySelector('.select-options');
        if (!optionsEl) return;

        // Cleanup listeners
        if (optionsEl.__repositionHandler) {
            window.removeEventListener('scroll', optionsEl.__repositionHandler, true);
            window.removeEventListener('resize', optionsEl.__repositionHandler);
            delete optionsEl.__repositionHandler;
        }

        // Hide
        optionsEl.style.display = 'none';
        optionsEl.classList.remove('portaled');
        optionsEl.style.position = '';
        optionsEl.style.top = '';
        optionsEl.style.left = '';
        optionsEl.style.width = '';
        optionsEl.style.zIndex = '';

        // Restore to original parent if needed
        if (optionsEl.__originalParent) {
            if (optionsEl.__originalNextSibling) {
                optionsEl.__originalParent.insertBefore(optionsEl, optionsEl.__originalNextSibling);
            } else {
                optionsEl.__originalParent.appendChild(optionsEl);
            }
            delete optionsEl.__originalParent;
            delete optionsEl.__originalNextSibling;
        }
    }
    
    /**
     * Update custom selector display
     */
    updateCustomSelectorDisplay(value) {
        const customSelect = document.getElementById('customLanguageSelector');
        if (!customSelect) return;
        
        const selectedOption = customSelect.querySelector('.selected-option');
        const options = customSelect.querySelectorAll('.option');
        
        // Flag icon mapping
        const flagMapping = {
            'auto': '<i class="fas fa-globe selected-flag-icon"></i>',
            'en': '<img src="icns/us.svg" alt="US Flag" class="flag-icon">',
            'tr': '<img src="icns/tr.svg" alt="Turkey Flag" class="flag-icon">',
            'ar': '<img src="icns/ar.svg" alt="Saudi Arabia Flag" class="flag-icon">',
            'de': '<img src="icns/de.svg" alt="Germany Flag" class="flag-icon">',
            'fr': '<img src="icns/fr.svg" alt="France Flag" class="flag-icon">',
            'es': '<img src="icns/es.svg" alt="Spain Flag" class="flag-icon">',
            'zh': '<img src="icns/cn.svg" alt="China Flag" class="flag-icon">',
            'ru': '<img src="icns/ru.svg" alt="Russia Flag" class="flag-icon">',
            'in': '<img src="icns/in.svg" alt="India Flag" class="flag-icon">'
        };
        
        // Language text mapping
        const languageMapping = {
            'auto': 'Auto',
            'en': 'English',
            'tr': 'Türkçe',
            'ar': 'العربية',
            'de': 'Deutsch',
            'fr': 'Français',
            'es': 'Español',
            'zh': '中文',
            'ru': 'Русский',
            'in': 'हिंदी'
        };
        
        // Update trigger display
        const flagIcon = flagMapping[value] || flagMapping['auto'];
        const languageText = languageMapping[value] || 'Auto';
        selectedOption.innerHTML = `${flagIcon} ${languageText}`;
        
        // Update option selection
        options.forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-value') === value) {
                option.classList.add('selected');
            }
        });
        
        // Update hidden select
        if (this.languageSelector) {
            this.languageSelector.value = value;
        }
    }

    // Country code mapping for phone numbers
    initializeCountryCodes() {
        return {
            'AE': { code: '+971', name: 'UAE' },
            'SA': { code: '+966', name: 'Saudi Arabia' },
            'EG': { code: '+20', name: 'Egypt' },
            'IQ': { code: '+964', name: 'Iraq' },
            'JO': { code: '+962', name: 'Jordan' },
            'LB': { code: '+961', name: 'Lebanon' },
            'SY': { code: '+963', name: 'Syria' },
            'KW': { code: '+965', name: 'Kuwait' },
            'QA': { code: '+974', name: 'Qatar' },
            'BH': { code: '+973', name: 'Bahrain' },
            'OM': { code: '+968', name: 'Oman' },
            'YE': { code: '+967', name: 'Yemen' },
            'LY': { code: '+218', name: 'Libya' },
            'TN': { code: '+216', name: 'Tunisia' },
            'DZ': { code: '+213', name: 'Algeria' },
            'MA': { code: '+212', name: 'Morocco' },
            'SD': { code: '+249', name: 'Sudan' },
            'MR': { code: '+222', name: 'Mauritania' },
            'SO': { code: '+252', name: 'Somalia' },
            'DJ': { code: '+253', name: 'Djibouti' },
            'KM': { code: '+269', name: 'Comoros' },
            'PS': { code: '+970', name: 'Palestine' },
            'TR': { code: '+90', name: 'Turkey' },
            'RU': { code: '+7', name: 'Russia' },
            'CN': { code: '+86', name: 'China' },
            'IN': { code: '+91', name: 'India' },
            'US': { code: '+1', name: 'United States' },
            'GB': { code: '+44', name: 'United Kingdom' },
            'DE': { code: '+49', name: 'Germany' },
            'FR': { code: '+33', name: 'France' },
            'ES': { code: '+34', name: 'Spain' },
            'IT': { code: '+39', name: 'Italy' },
            'NL': { code: '+31', name: 'Netherlands' },
            'BE': { code: '+32', name: 'Belgium' },
            'CH': { code: '+41', name: 'Switzerland' },
            'AT': { code: '+43', name: 'Austria' },
            'SE': { code: '+46', name: 'Sweden' },
            'NO': { code: '+47', name: 'Norway' },
            'DK': { code: '+45', name: 'Denmark' },
            'FI': { code: '+358', name: 'Finland' },
            'PL': { code: '+48', name: 'Poland' },
            'CZ': { code: '+420', name: 'Czech Republic' },
            'HU': { code: '+36', name: 'Hungary' },
            'RO': { code: '+40', name: 'Romania' },
            'BG': { code: '+359', name: 'Bulgaria' },
            'GR': { code: '+30', name: 'Greece' },
            'PT': { code: '+351', name: 'Portugal' },
            'IE': { code: '+353', name: 'Ireland' },
            'IS': { code: '+354', name: 'Iceland' },
            'LU': { code: '+352', name: 'Luxembourg' },
            'MT': { code: '+356', name: 'Malta' },
            'CY': { code: '+357', name: 'Cyprus' },
            'EE': { code: '+372', name: 'Estonia' },
            'LV': { code: '+371', name: 'Latvia' },
            'LT': { code: '+370', name: 'Lithuania' },
            'SI': { code: '+386', name: 'Slovenia' },
            'SK': { code: '+421', name: 'Slovakia' },
            'HR': { code: '+385', name: 'Croatia' },
            'BA': { code: '+387', name: 'Bosnia and Herzegovina' },
            'RS': { code: '+381', name: 'Serbia' },
            'ME': { code: '+382', name: 'Montenegro' },
            'MK': { code: '+389', name: 'North Macedonia' },
            'AL': { code: '+355', name: 'Albania' },
            'MD': { code: '+373', name: 'Moldova' },
            'UA': { code: '+380', name: 'Ukraine' },
            'BY': { code: '+375', name: 'Belarus' },
            'LI': { code: '+423', name: 'Liechtenstein' },
            'MC': { code: '+377', name: 'Monaco' },
            'SM': { code: '+378', name: 'San Marino' },
            'AD': { code: '+376', name: 'Andorra' },
            'VA': { code: '+379', name: 'Vatican City' }
        };
    }

    // Country-City data mapping - now uses data from translation files
    initializeCountryCities() {
        // Return a function that dynamically gets cities from translation files
        // This will be populated after translations are loaded
        return {};
    }

    // Get cities for a specific country from the translation files
    // This method dynamically retrieves cities from the loaded translation data
    getCitiesForCountry(countryCode) {
        if (!this.translations || !this.translations[this.currentLanguage]) {
            return [];
        }

        const cities = this.translations[this.currentLanguage].cities;
        if (!cities || !cities[countryCode]) {
            return [];
        }

        // Return array of city keys (which are the city names in English)
        // These keys are used as values, while the translated names are displayed
        return Object.keys(cities[countryCode]);
    }

    setupCountryCityDropdown() {
        const countrySelect = document.getElementById('country');
        const citySelect = document.getElementById('city');
        
        if (!countrySelect || !citySelect) return;
        
        countrySelect.addEventListener('change', (e) => this.handleCountryChange(e));
        citySelect.addEventListener('change', (e) => this.handleCityChange(e));
        
        // Setup industry field dropdown
        this.setupIndustryFieldDropdown();
    }

    setupIndustryFieldDropdown() {
        const industrySelect = document.getElementById('industryField');
        
        if (!industrySelect) return;
        
        industrySelect.addEventListener('change', (e) => this.handleIndustryChange(e));
    }

    handleCountryChange(event) {
        const selectedCountry = event.target.value;
        const citySelect = document.getElementById('city');
        
        // Clear city dropdown
        citySelect.innerHTML = `<option value="">${this.getTranslation('sections.factoryInfo.city.placeholder') || 'Select City'}</option>`;
        citySelect.disabled = true;
        
        if (selectedCountry && selectedCountry !== 'other') {
            const cities = this.getCitiesForCountry(selectedCountry);
            if (cities && cities.length > 0) {
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    // Use translation system for city names
                    const translatedCity = this.getTranslation(`cities.${selectedCountry}.${city}`) || city;
                    option.textContent = translatedCity;
                    citySelect.appendChild(option);
                });
                
                // Always add "Other" option at the end for any country
                const otherOption = document.createElement('option');
                otherOption.value = 'other';
                otherOption.textContent = this.getTranslation('sections.factoryInfo.city.other') || 'Other (Please specify)';
                citySelect.appendChild(otherOption);
                
                citySelect.disabled = false;
            }
        } else if (selectedCountry === 'other') {
            const otherOption = this.getTranslation('sections.factoryInfo.city.other') || 'Other (Please specify)';
            citySelect.innerHTML = `<option value="">${this.getTranslation('sections.factoryInfo.city.placeholder') || 'Select City'}</option><option value="other">${otherOption}</option>`;
            citySelect.disabled = false;
        }
        
        citySelect.value = '';
    }


    handleCityChange(event) {
        if (event.target.value === 'other') {
            this.replaceCitySelectWithInput();
        }
    }

    handleIndustryChange(event) {
        if (event.target.value === 'other') {
            this.replaceIndustrySelectWithInput();
        }
    }

    replaceCitySelectWithInput() {
        const citySelect = document.getElementById('city');
        const cityGroup = citySelect.parentNode;
        
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = 'city';
        textInput.name = 'city';
        textInput.required = true;
        textInput.placeholder = this.getTranslation('sections.factoryInfo.city.customPlaceholder') || 'Enter city name';
        textInput.maxLength = 100;
        textInput.setAttribute('aria-describedby', 'city-error');
        
        cityGroup.replaceChild(textInput, citySelect);
        textInput.focus();
        
        // Re-setup event listeners for the new input
        this.setupFieldValidation(textInput);
    }

    replaceIndustrySelectWithInput() {
        const industrySelect = document.getElementById('industryField');
        const industryGroup = industrySelect.parentNode;
        
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = 'industryField';
        textInput.name = 'industryField';
        textInput.required = true;
        textInput.placeholder = this.getTranslation('sections.productionInfo.productType.customPlaceholder') || 'Enter industry type';
        textInput.maxLength = 100;
        textInput.setAttribute('aria-describedby', 'industryField-error');
        
        industryGroup.replaceChild(textInput, industrySelect);
        textInput.focus();
        
        // Re-setup event listeners for the new input
        this.setupFieldValidation(textInput);
    }

    setupDynamicSections() {
        this.setupOwnersSection();
        this.setupProductionLinesSection();
    }

    setupOwnersSection() {
        const addBtn = document.getElementById('addOwnerBtn');
        if (!addBtn) return;
        
        addBtn.addEventListener('click', () => this.addOwner());
    }

    addOwner() {
        this.ownerIndex++;
        const ownersContainer = document.getElementById('ownersContainer');
        const block = this.createOwnerBlock(this.ownerIndex);
        ownersContainer.appendChild(block);
        
        block.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.saveFormData();
    }

    createOwnerBlock(index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'owner-block';
        wrapper.setAttribute('data-owner-index', String(index));
        
        const ownerNameLabel = this.getTranslation('sections.ownerInfo.ownerName.label') || 'Owner Name';
        const ownerEmailLabel = this.getTranslation('sections.ownerInfo.ownerEmail.label') || 'Owner Email';
        const ownerPhoneLabel = this.getTranslation('sections.ownerInfo.ownerPhone.label') || 'Mobile Number';
        const removeOwnerText = this.getTranslation('sections.ownerInfo.removeOwner') || 'Remove Owner';
        const ownerNamePlaceholder = this.getTranslation('sections.ownerInfo.ownerName.placeholder') || 'Enter owner name';
        const ownerEmailPlaceholder = this.getTranslation('sections.ownerInfo.ownerEmail.placeholder') || 'owner@example.com';
        const ownerPhonePlaceholder = this.getTranslation('sections.ownerInfo.ownerPhone.placeholder') || '+1 (555) 123-4567';
        
        // Generate country code options
        const countryCodeOptions = this.generateCountryCodeOptions();
        
        // Generate country options for Made In field
        const countryOptions = this.generateCountryOptions();
        
        wrapper.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="ownerName_${index}">${ownerNameLabel} <span class="required" aria-label="required">*</span></label>
                    <input 
                        type="text" 
                        id="ownerName_${index}" 
                        name="ownerName_${index}" 
                        required
                        aria-describedby="ownerName_${index}-error"
                        placeholder="${ownerNamePlaceholder}"
                        maxlength="100"
                    >
                    <div id="ownerName_${index}-error" class="error-message" role="alert" aria-live="polite"></div>
                </div>
                <div class="form-group">
                    <label for="ownerEmail_${index}">${ownerEmailLabel} <span class="required" aria-label="required">*</span></label>
                    <input 
                        type="email" 
                        id="ownerEmail_${index}" 
                        name="ownerEmail_${index}" 
                        required
                        aria-describedby="ownerEmail_${index}-error"
                        placeholder="${ownerEmailPlaceholder}"
                        maxlength="100"
                    >
                    <div id="ownerEmail_${index}-error" class="error-message" role="alert" aria-live="polite"></div>
                </div>
                </div>
                <div class="form-group">
                    <label for="ownerMobile_${index}">${ownerPhoneLabel} <span class="required" aria-label="required">*</span></label>
                    <div class="phone-input-container">
                        <select class="country-code-selector" name="ownerMobileCountryCode_${index}" aria-label="Country code">
                            ${countryCodeOptions}
                        </select>
                        <input 
                            type="tel" 
                            id="ownerMobile_${index}" 
                            name="ownerMobile_${index}" 
                            required
                            aria-describedby="ownerMobile_${index}-error"
                            placeholder="${ownerPhonePlaceholder}"
                            maxlength="20"
                        >
                    </div>
                    <div id="ownerMobile_${index}-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" data-remove-owner aria-label="Remove this owner">
                    <i class="fas fa-user-minus" aria-hidden="true"></i> <span>${removeOwnerText}</span>
                </button>
            </div>
        `;
        
        const removeBtn = wrapper.querySelector('[data-remove-owner]');
        removeBtn.addEventListener('click', () => this.removeOwner(wrapper));
        
        // Setup validation for new fields
        const inputs = wrapper.querySelectorAll('input');
        inputs.forEach(input => this.setupFieldValidation(input));
        
        // Setup phone formatting for the new phone field
        const phoneField = wrapper.querySelector('input[type="tel"]');
        const countryCodeSelector = wrapper.querySelector('.country-code-selector');
        const countrySelect = document.getElementById('country');
        
        if (phoneField) {
            phoneField.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target, countryCodeSelector, countrySelect);
            });
            
            if (countryCodeSelector) {
                countryCodeSelector.addEventListener('change', () => {
                    this.formatPhoneNumber(phoneField, countryCodeSelector, countrySelect);
                });
            }
        }
        
        return wrapper;
    }

    removeOwner(wrapper) {
        const ownersContainer = document.getElementById('ownersContainer');
        const blocks = ownersContainer.querySelectorAll('.owner-block');
        
        if (blocks.length <= 1) {
            this.showNotification('Removing owner blocked', 'warning');
            return;
        }
        
        wrapper.remove();
        this.renumberOwnerBlocks();
        this.saveFormData();
    }

    renumberOwnerBlocks() {
        const ownersContainer = document.getElementById('ownersContainer');
        const blocks = Array.from(ownersContainer.querySelectorAll('.owner-block'));
        
        blocks.forEach((block, idx) => {
            const index = idx + 1;
            block.setAttribute('data-owner-index', String(index));
            
            const nameInput = block.querySelector('[id^="ownerName_"]');
            const emailInput = block.querySelector('[id^="ownerEmail_"]');
            const mobileInput = block.querySelector('[id^="ownerMobile_"]');
            const countryCodeSelector = block.querySelector('[name^="ownerMobileCountryCode_"]');
            const nameLabel = block.querySelector('label[for^="ownerName_"]');
            const emailLabel = block.querySelector('label[for^="ownerEmail_"]');
            const mobileLabel = block.querySelector('label[for^="ownerMobile_"]');
            
            if (nameInput) {
                nameInput.id = `ownerName_${index}`;
                nameInput.name = `ownerName_${index}`;
                nameInput.setAttribute('aria-describedby', `ownerName_${index}-error`);
            }
            if (emailInput) {
                emailInput.id = `ownerEmail_${index}`;
                emailInput.name = `ownerEmail_${index}`;
                emailInput.setAttribute('aria-describedby', `ownerEmail_${index}-error`);
            }
            if (mobileInput) {
                mobileInput.id = `ownerMobile_${index}`;
                mobileInput.name = `ownerMobile_${index}`;
                mobileInput.setAttribute('aria-describedby', `ownerMobile_${index}-error`);
            }
            if (countryCodeSelector) {
                countryCodeSelector.name = `ownerMobileCountryCode_${index}`;
            }
            if (nameLabel) nameLabel.setAttribute('for', `ownerName_${index}`);
            if (emailLabel) emailLabel.setAttribute('for', `ownerEmail_${index}`);
            if (mobileLabel) mobileLabel.setAttribute('for', `ownerMobile_${index}`);
        });
    }

    setupProductionLinesSection() {
        const addBtn = document.getElementById('addProductionLineBtn');
        if (!addBtn) return;
        
        addBtn.addEventListener('click', () => this.addProductionLine());
    }

    addProductionLine() {
        this.productionLineIndex++;
        const container = document.getElementById('productionLinesContainer');
        const block = this.createProductionLineBlock(this.productionLineIndex);
        container.appendChild(block);
        
        block.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.saveFormData();
    }

    createProductionLineBlock(index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'production-line-block';
        wrapper.setAttribute('data-line-index', String(index));
        
        const productionLineLabel = this.getTranslation('sections.productionInfo.productionLine.label') || 'Production Line';
        const brandNameLabel = this.getTranslation('sections.productionInfo.brandName.label') || 'Brand Name';
        const madeInLabel = this.getTranslation('sections.productionInfo.madeIn.label') || 'Made In';
        const removeProductionLineText = this.getTranslation('sections.productionInfo.removeProductionLine') || 'Remove Production Line';
        const productionLinePlaceholder = this.getTranslation('sections.productionInfo.productionLine.placeholder') || 'e.g., Assembly Line A, Manufacturing Unit 1';
        const brandNamePlaceholder = this.getTranslation('sections.productionInfo.brandName.placeholder') || 'e.g., Brand X, Company Y';
        const madeInPlaceholder = this.getTranslation('sections.productionInfo.madeIn.placeholder') || 'Select Country';
        
        // Generate country options for Made In field
        const countryOptions = this.generateCountryOptions();
        
        wrapper.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="productionLine_${index}">${productionLineLabel} <span class="required" aria-label="required">*</span></label>
                        <input 
                            type="text" 
                            id="productionLine_${index}" 
                            name="productionLine_${index}" 
                            placeholder="${productionLinePlaceholder}" 
                            required
                            aria-describedby="productionLine_${index}-error"
                            maxlength="100"
                        >
                    <div id="productionLine_${index}-error" class="error-message" role="alert" aria-live="polite"></div>
                </div>
                <div class="form-group">
                    <label for="brandName_${index}">${brandNameLabel} <span class="required" aria-label="required">*</span></label>
                        <input 
                            type="text" 
                            id="brandName_${index}" 
                            name="brandName_${index}" 
                            placeholder="${brandNamePlaceholder}" 
                            required
                            aria-describedby="brandName_${index}-error"
                            maxlength="100"
                        >
                    <div id="brandName_${index}-error" class="error-message" role="alert" aria-live="polite"></div>
                </div>
            </div>
            <div class="form-group">
                <label for="madeIn_${index}">${madeInLabel} <span class="required" aria-label="required">*</span></label>
                <select 
                    id="madeIn_${index}" 
                    name="madeIn_${index}" 
                    required
                    aria-describedby="madeIn_${index}-error"
                >
                    <option value="">${madeInPlaceholder}</option>
                    ${countryOptions}
                </select>
                <div id="madeIn_${index}-error" class="error-message" role="alert" aria-live="polite"></div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" data-remove-production-line aria-label="Remove this production line">
                    <i class="fas fa-minus" aria-hidden="true"></i> <span>${removeProductionLineText}</span>
                </button>
            </div>
        `;
        
        const removeBtn = wrapper.querySelector('[data-remove-production-line]');
        removeBtn.addEventListener('click', () => this.removeProductionLine(wrapper));
        
        // Setup validation for new fields
        const inputs = wrapper.querySelectorAll('input');
        inputs.forEach(input => this.setupFieldValidation(input));
        
        return wrapper;
    }

    removeProductionLine(wrapper) {
        const container = document.getElementById('productionLinesContainer');
        const blocks = container.querySelectorAll('.production-line-block');
        
        if (blocks.length <= 1) {
            this.showNotification('Removing production line blocked', 'warning');
            return;
        }
        
        wrapper.remove();
        this.renumberProductionLineBlocks();
        this.saveFormData();
    }

    renumberProductionLineBlocks() {
        const container = document.getElementById('productionLinesContainer');
        const blocks = Array.from(container.querySelectorAll('.production-line-block'));
        
        blocks.forEach((block, idx) => {
            const index = idx + 1;
            block.setAttribute('data-line-index', String(index));
            
            const lineInput = block.querySelector('[id^="productionLine_"]');
            const brandInput = block.querySelector('[id^="brandName_"]');
            const madeInSelect = block.querySelector('[id^="madeIn_"]');
            const lineLabel = block.querySelector('label[for^="productionLine_"]');
            const brandLabel = block.querySelector('label[for^="brandName_"]');
            const madeInLabel = block.querySelector('label[for^="madeIn_"]');
            
            if (lineInput) {
                lineInput.id = `productionLine_${index}`;
                lineInput.name = `productionLine_${index}`;
                lineInput.setAttribute('aria-describedby', `productionLine_${index}-error`);
            }
            if (brandInput) {
                brandInput.id = `brandName_${index}`;
                brandInput.name = `brandName_${index}`;
                brandInput.setAttribute('aria-describedby', `brandName_${index}-error`);
            }
            if (madeInSelect) {
                madeInSelect.id = `madeIn_${index}`;
                madeInSelect.name = `madeIn_${index}`;
                madeInSelect.setAttribute('aria-describedby', `madeIn_${index}-error`);
            }
            if (lineLabel) lineLabel.setAttribute('for', `productionLine_${index}`);
            if (brandLabel) brandLabel.setAttribute('for', `brandName_${index}`);
            if (madeInLabel) madeInLabel.setAttribute('for', `madeIn_${index}`);
        });
    }

    setupGoogleMaps() {
        // Check if Google Maps API is loaded
        if (typeof google === 'undefined' || !google.maps) {
            console.warn('Google Maps API not loaded. Map functionality will be disabled.');
            this.showMapPlaceholder();
            return;
        }

        try {
            this.initializeMap();
            this.setupMapControls();
        } catch (error) {
            console.error('Error initializing Google Maps:', error);
            this.showMapPlaceholder();
        }
    }

    showMapPlaceholder() {
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center;">
                    <i class="fas fa-map-marker-alt" style="font-size: 48px; color: #64748b; margin-bottom: 16px;"></i>
                    <p style="color: #64748b; margin: 0;">Google Maps API needed</p>
                    <small style="color: #94a3b8; margin-top: 8px;">Update API key</small>
                </div>
            `;
        }
    }

    initializeMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        this.map = new google.maps.Map(mapElement, {
            center: { lat: 25.2048, lng: 55.2708 }, // Default to Dubai
            zoom: 13,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
        });

        this.geocoder = new google.maps.Geocoder();

        // Add click listener to map
        this.map.addListener('click', (event) => {
            this.placeMarker(event.latLng);
            this.getAddressFromCoordinates(event.latLng);
        });
    }

    setupMapControls() {
        const currentLocationBtn = document.getElementById('getCurrentLocation');
        const searchLocationBtn = document.getElementById('searchLocation');
        
        if (currentLocationBtn) {
            currentLocationBtn.addEventListener('click', () => this.getCurrentLocation());
        }
        
        if (searchLocationBtn) {
            searchLocationBtn.addEventListener('click', () => this.searchLocation());
        }
    }

    getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showNotification('Geolocation not supported', 'error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                this.map.setCenter(pos);
                this.placeMarker(pos);
                this.getAddressFromCoordinates(pos);
            },
            (error) => {
                this.showNotification(`Submit failed: ${error.message}`, 'error');
            }
        );
    }

    searchLocation() {
        const address = prompt('Enter address to search');
        if (address) {
            this.geocodeAddress(address);
        }
    }

    placeMarker(latLng) {
        if (this.marker) {
            this.marker.setMap(null);
        }
        
        this.marker = new google.maps.Marker({
            position: latLng,
            map: this.map,
            draggable: true,
            title: 'Marker'
        });

        // Update coordinates display
        const latInput = document.getElementById('latitude');
        const lngInput = document.getElementById('longitude');
        
        if (latInput) latInput.value = latLng.lat().toFixed(6);
        if (lngInput) lngInput.value = latLng.lng().toFixed(6);

        // Add drag listener to update address when marker is moved
        this.marker.addListener('dragend', () => {
            this.getAddressFromCoordinates(this.marker.getPosition());
        });
    }

    getAddressFromCoordinates(latLng) {
        if (!this.geocoder) return;
        
        this.geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const addressInput = document.getElementById('detailedAddress');
                if (addressInput) {
                    addressInput.value = results[0].formatted_address;
                }
            } else {
                console.error('Geocoder failed due to:', status);
            }
        });
    }

    geocodeAddress(address) {
        if (!this.geocoder) return;
        
        this.geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                this.map.setCenter(location);
                this.placeMarker(location);
                
                const addressInput = document.getElementById('detailedAddress');
                if (addressInput) {
                    addressInput.value = results[0].formatted_address;
                }
            } else {
                    this.showNotification(`Geocoding failed: ${status}`, 'error');
            }
        });
    }

    setupRealTimeValidation() {
        const fields = this.form.querySelectorAll('input, select, textarea');
        fields.forEach(field => this.setupFieldValidation(field));
    }

    setupFieldValidation(field) {
        field.addEventListener('blur', () => this.validateField(field));
        field.addEventListener('input', () => this.clearFieldError(field));
    }

    validateField(field) {
        this.clearFieldError(field);
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        if (field.type === 'email' && field.value && !this.isValidEmail(field.value)) {
            this.showFieldError(field, 'Invalid email address');
            return false;
        }
        
        if (field.type === 'tel' && field.value) {
            const countryCodeSelector = field.parentNode.querySelector('.country-code-selector');
            const countryCode = countryCodeSelector ? countryCodeSelector.value : this.getDefaultCountryCode(document.getElementById('country'));
            
            if (!this.isValidPhone(field.value, countryCode)) {
                this.showFieldError(field, 'Invalid phone number');
                return false;
            }
        }
        
        return true;
    }

    showFieldError(field, message) {
        const errorId = field.getAttribute('aria-describedby');
        if (!errorId) return;
        
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        
        field.style.borderColor = '#ef4444';
    }

    clearFieldError(field) {
        const errorId = field.getAttribute('aria-describedby');
        if (!errorId) return;
        
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        
        field.style.borderColor = '#e2e8f0';
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone, countryCode = '+1') {
        // Remove all non-digit characters except +
        let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        
        // If phone starts with country code, remove it for validation
        const codeDigits = countryCode.replace('+', '');
        if (cleanPhone.startsWith(codeDigits)) {
            cleanPhone = cleanPhone.substring(codeDigits.length);
        }
        
        // Basic validation - should be 7-15 digits after country code
        const phoneRegex = /^[1-9]\d{6,14}$/;
        return phoneRegex.test(cleanPhone);
    }

    setupPhoneFormatting() {
        const phoneFields = this.form.querySelectorAll('input[type="tel"]');
        
        phoneFields.forEach(phoneField => {
            // Get the associated country code selector
            const countryCodeSelector = phoneField.parentNode.querySelector('.country-code-selector');
            const countrySelect = document.getElementById('country');
            
            phoneField.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target, countryCodeSelector, countrySelect);
            });
            
            // Update phone formatting when country code changes
            if (countryCodeSelector) {
                countryCodeSelector.addEventListener('change', () => {
                    this.formatPhoneNumber(phoneField, countryCodeSelector, countrySelect);
                });
            }
            
            // Update phone formatting when country changes
            if (countrySelect) {
                countrySelect.addEventListener('change', () => {
                    this.updatePhoneCountryCode(countryCodeSelector, countrySelect);
                    this.formatPhoneNumber(phoneField, countryCodeSelector, countrySelect);
                });
            }
        });
    }

    formatPhoneNumber(phoneField, countryCodeSelector, countrySelect) {
        let value = phoneField.value.replace(/\D/g, '');
        const countryCode = countryCodeSelector ? countryCodeSelector.value : this.getDefaultCountryCode(countrySelect);
        
        // Remove country code from the beginning if it exists
        if (countryCode && value.startsWith(countryCode.replace('+', ''))) {
            value = value.substring(countryCode.replace('+', '').length);
        }
        
        // Format the number based on country
        const formattedNumber = this.formatNumberByCountry(value, countryCode);
        phoneField.value = formattedNumber;
    }

    getDefaultCountryCode(countrySelect) {
        if (!countrySelect || !countrySelect.value) return '+1';
        return this.countryCodes[countrySelect.value]?.code || '+1';
    }

    updatePhoneCountryCode(countryCodeSelector, countrySelect) {
        if (!countryCodeSelector || !countrySelect) return;
        
        const selectedCountry = countrySelect.value;
        const countryCode = this.countryCodes[selectedCountry]?.code || '+1';
        
        // Update the country code selector
        countryCodeSelector.value = countryCode;
        
        // Update the display text
        const option = countryCodeSelector.querySelector(`option[value="${countryCode}"]`);
        if (option) {
            countryCodeSelector.selectedIndex = option.index;
        }
    }

    formatNumberByCountry(number, countryCode) {
        if (!number) return '';
        
        // Common formatting patterns by country
        const patterns = {
            '+1': (num) => {
                if (num.length <= 3) return `(${num}`;
                if (num.length <= 6) return `(${num.slice(0, 3)}) ${num.slice(3)}`;
                return `(${num.slice(0, 3)}) ${num.slice(3, 6)}-${num.slice(6, 10)}`;
            },
            '+44': (num) => {
                if (num.length <= 4) return num;
                if (num.length <= 7) return `${num.slice(0, 4)} ${num.slice(4)}`;
                return `${num.slice(0, 4)} ${num.slice(4, 7)} ${num.slice(7)}`;
            },
            '+971': (num) => {
                if (num.length <= 2) return num;
                if (num.length <= 5) return `${num.slice(0, 2)} ${num.slice(2)}`;
                return `${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
            },
            '+966': (num) => {
                if (num.length <= 2) return num;
                if (num.length <= 5) return `${num.slice(0, 2)} ${num.slice(2)}`;
                return `${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
            },
            '+20': (num) => {
                if (num.length <= 2) return num;
                if (num.length <= 5) return `${num.slice(0, 2)} ${num.slice(2)}`;
                return `${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`;
            },
            '+90': (num) => {
                if (num.length <= 3) return num;
                if (num.length <= 6) return `${num.slice(0, 3)} ${num.slice(3)}`;
                return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
            }
        };
        
        const formatter = patterns[countryCode] || patterns['+1'];
        return formatter(number);
    }

    generateCountryCodeOptions() {
        let options = '';
        const countrySelect = document.getElementById('country');
        const selectedCountry = countrySelect ? countrySelect.value : '';
        
        // Get the default country code based on selected country
        const defaultCode = this.getDefaultCountryCode(countrySelect);
        
        // Sort country codes for better UX
        const sortedCodes = Object.entries(this.countryCodes)
            .sort((a, b) => a[1].name.localeCompare(b[1].name));
        
        sortedCodes.forEach(([countryCode, data]) => {
            const selected = data.code === defaultCode ? 'selected' : '';
            options += `<option value="${data.code}" ${selected}>${data.code} ${data.name}</option>`;
        });
        
        return options;
    }

    generateCountryOptions() {
        let options = '';
        
        // Sort countries alphabetically by their translated names
        const sortedCountries = Object.keys(this.countryCodes)
            .sort((a, b) => {
                const nameA = this.getTranslation(`countries.${a}`) || this.countryCodes[a].name;
                const nameB = this.getTranslation(`countries.${b}`) || this.countryCodes[b].name;
                return nameA.localeCompare(nameB);
            });
        
        sortedCountries.forEach(countryCode => {
            const translatedName = this.getTranslation(`countries.${countryCode}`) || this.countryCodes[countryCode].name;
            options += `<option value="${countryCode}">${translatedName}</option>`;
        });
        
        return options;
    }

    populateCountryCodeSelectors() {
        const countryCodeSelectors = this.form.querySelectorAll('.country-code-selector');
        const countryCodeOptions = this.generateCountryCodeOptions();
        
        countryCodeSelectors.forEach(selector => {
            selector.innerHTML = countryCodeOptions;
        });
    }

    setupAutoSave() {
        const fields = this.form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            field.addEventListener('input', () => this.saveFormData());
            field.addEventListener('change', () => this.saveFormData());
        });
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.currentLanguage === 'ar') {
                    this.fixRTLMobileVisibility();
                }
            }, 250);
        });
    }

    saveFormData() {
        try {
            const formData = new FormData(this.form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }

            // Persist counts for restoration
            const ownersCount = document.querySelectorAll('#ownersContainer .owner-block').length;
            const productionLinesCount = document.querySelectorAll('#productionLinesContainer .production-line-block').length;
            
            data.__ownersCount = ownersCount;
            data.__productionLinesCount = productionLinesCount;
            
            localStorage.setItem('factoryFormData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving form data:', error);
        }
    }

    loadFormData() {
        try {
            const savedData = localStorage.getItem('factoryFormData');
            if (!savedData) return;
            
            const data = JSON.parse(savedData);
            
            // Restore dynamic sections first
            this.restoreDynamicSections(data);
            
            // Restore form values
            Object.keys(data).forEach(key => {
                if (key.startsWith('__')) return; // Skip internal keys
                
                const field = this.form.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = data[key] === 'on';
                    } else if (field.type === 'radio') {
                        const radioField = this.form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                        if (radioField) {
                            radioField.checked = true;
                        }
                    } else {
                        field.value = data[key];
                    }
                }
            });
            
            // Handle city field restoration
            this.restoreCityField(data);
            
        } catch (error) {
            console.error('Error loading saved form data:', error);
        }
    }

    restoreDynamicSections(data) {
        // Restore owners
        if (data.__ownersCount && Number(data.__ownersCount) > 1) {
            const desired = Number(data.__ownersCount);
            const current = document.querySelectorAll('#ownersContainer .owner-block').length;
            for (let i = current + 1; i <= desired; i++) {
                this.addOwner();
            }
        }
        
        // Restore production lines
        if (data.__productionLinesCount && Number(data.__productionLinesCount) > 1) {
            const desired = Number(data.__productionLinesCount);
            const current = document.querySelectorAll('#productionLinesContainer .production-line-block').length;
            for (let i = current + 1; i <= desired; i++) {
                this.addProductionLine();
            }
        }
    }

    restoreCityField(data) {
        if (!data.country || !data.city) return;
        
        const countrySelect = document.getElementById('country');
        const cityField = document.getElementById('city');
        
        if (!countrySelect || !cityField) return;
        
        // Trigger country change to populate cities
        countrySelect.dispatchEvent(new Event('change'));
        
        // Set city value after a short delay
        setTimeout(() => {
            if (cityField.tagName === 'SELECT' || cityField.tagName === 'INPUT') {
                cityField.value = data.city;
            }
        }, 100);
    }

    handleFormSubmit(event) {
        event.preventDefault();
        
        if (this.validateForm()) {
            this.submitForm();
        }
    }

    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;
        
        // Clear previous errors
        this.clearAllErrors();
        
        // Validate required fields
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    clearAllErrors() {
        const errorMessages = this.form.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.classList.remove('show'));
        
        const fields = this.form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.style.borderColor = '#e2e8f0';
        });
    }

    async submitForm() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting...`;
            
            // Collect form data
            const formData = new FormData(this.form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // Add submission timestamp
            data.submissionDate = new Date().toISOString();
            
            // Add additional metadata
            data.submissionId = this.generateSubmissionId();
            data.userAgent = navigator.userAgent;
            data.timestamp = Date.now();
            
            // Send data to server
            const response = await this.submitToServer(data);
            
            if (response.success) {
                // Show success message
                this.showSuccessMessage();
                
                // Clear saved data from localStorage
                localStorage.removeItem('factoryFormData');
                
                // Log success
                console.log('Form submitted successfully:', response);
                
                // Show submission ID to user
                this.showNotification(`Submission successful: ${data.submissionId}`, 'success');
            } else {
                throw new Error(response.message || 'Server submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
                this.showNotification(`Submit failed: ${error.message}`, 'error');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    async submitToServer(data) {
        // Configuration for server endpoint
        const serverConfig = {
            endpoint: 'v2/factory-registration',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        try {
            // For demonstration - replace with your actual server endpoint
            if (this.isDevelopmentMode()) {
                // Simulate server submission in development
                return await this.simulateServerSubmission(data);
            } else {
                // Real server submission
                const response = await fetch(serverConfig.endpoint, {
                    method: serverConfig.method,
                    headers: serverConfig.headers,
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                
                // Handle email notification results
                if (result.emails) {
                    this.handleEmailResults(result.emails);
                }
                
                return result;
            }
        } catch (error) {
            console.error('Server submission error:', error);
            throw new Error('Failed to connect to server. Please check your internet connection and try again.');
        }
    }

    handleEmailResults(emailResults) {
        // Show email notification results to user
        if (emailResults.company_email_sent && emailResults.customer_email_sent) {
            this.showNotification('Confirmation emails sent successfully!', 'success');
        } else if (emailResults.company_email_sent || emailResults.customer_email_sent) {
            this.showNotification('Some confirmation emails sent. Please check your email.', 'warning');
        } else {
            this.showNotification('Registration saved but email notifications failed. We will contact you soon.', 'warning');
        }
        
        // Log any email errors
        if (emailResults.errors && emailResults.errors.length > 0) {
            console.warn('Email notification errors:', emailResults.errors);
        }
    } 
    simulateServerSubmission(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Simulating server submission with data:', data);
                
                // Simulate successful server response
                resolve({
                    success: true,
                    message: 'Form submitted successfully',
                    submissionId: data.submissionId,
                    timestamp: new Date().toISOString()
                });
            }, 2000);
        });
    }

    generateSubmissionId() {
        // Generate a unique submission ID
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `FACTORY_${timestamp}_${random}`.toUpperCase();
    }

    isDevelopmentMode() {
        // Check if we're in development mode
        const isLocal = window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
        const isFile = window.location.protocol === 'file:';
        // When served via Flask on localhost (http), use real backend, not simulation
        if (isLocal && window.location.protocol.startsWith('http')) {
            return false;
        }
        return isLocal || isFile;
    }

    showSuccessMessage() {
        this.form.style.display = 'none';
        this.successMessage.style.display = 'block';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showForm() {
        this.successMessage.style.display = 'none';
        this.form.style.display = 'block';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    resetForm() {
        if (confirm('Are you sure you want to reset the form?')) {
            this.form.reset();
            this.clearAllErrors();
            localStorage.removeItem('factoryFormData');

            // Reset dynamic sections
            this.resetDynamicSections();
            
            // Reset city field
            this.resetCityField();
            
            // Reset industry field
            this.resetIndustryField();
            
            this.showNotification('Form reset successfully', 'success');
        }
    }

    resetDynamicSections() {
        // Reset owners
        const ownersContainer = document.getElementById('ownersContainer');
        if (ownersContainer) {
            ownersContainer.innerHTML = '';
            const block = this.createOwnerBlock(1);
            ownersContainer.appendChild(block);
        }
        
        // Reset production lines
        const productionLinesContainer = document.getElementById('productionLinesContainer');
        if (productionLinesContainer) {
            productionLinesContainer.innerHTML = '';
            const block = this.createProductionLineBlock(1);
            productionLinesContainer.appendChild(block);
        }
        
        // Reset indices
        this.ownerIndex = 1;
        this.productionLineIndex = 1;
    }

    resetCityField() {
        const cityField = document.getElementById('city');
        if (!cityField) return;
        
        if (cityField.tagName === 'INPUT') {
            const cityGroup = cityField.parentNode;
            const citySelect = document.createElement('select');
            citySelect.id = 'city';
            citySelect.name = 'city';
            citySelect.required = true;
            citySelect.disabled = true;
            citySelect.innerHTML = `<option value="">${this.getTranslation('sections.factoryInfo.city.placeholder') || 'Select Country First'}</option>`;
            citySelect.setAttribute('aria-describedby', 'city-error');
            
            cityGroup.replaceChild(citySelect, cityField);
            this.setupFieldValidation(citySelect);
            } else {
            cityField.innerHTML = `<option value="">${this.getTranslation('sections.factoryInfo.city.placeholder') || 'Select Country First'}</option>`;
            cityField.disabled = true;
        }
    }

    resetIndustryField() {
        const industryField = document.getElementById('industryField');
        if (!industryField) return;
        
        if (industryField.tagName === 'INPUT') {
            const industryGroup = industryField.parentNode;
            const industrySelect = document.createElement('select');
            industrySelect.id = 'industryField';
            industrySelect.name = 'industryField';
            industrySelect.required = true;
            industrySelect.setAttribute('aria-describedby', 'industryField-error');
            
            // Recreate the industry options
            industrySelect.innerHTML = `
                <option value="">${this.getTranslation('sections.productionInfo.productType.placeholder') || 'Select Industry Field'}</option>
                <option value="automotive">${this.getTranslation('productTypes.automotive') || 'Automotive'}</option>
                <option value="electronics">${this.getTranslation('productTypes.electronics') || 'Electronics'}</option>
                <option value="textiles">${this.getTranslation('productTypes.textiles') || 'Textiles'}</option>
                <option value="chemicals">${this.getTranslation('productTypes.chemicals') || 'Chemicals'}</option>
                <option value="pharmaceuticals">${this.getTranslation('productTypes.pharmaceuticals') || 'Pharmaceuticals'}</option>
                <option value="food_beverage">${this.getTranslation('productTypes.food_beverage') || 'Food & Beverage'}</option>
                <option value="machinery">${this.getTranslation('productTypes.machinery') || 'Machinery & Equipment'}</option>
                <option value="metals">${this.getTranslation('productTypes.metals') || 'Metals & Mining'}</option>
                <option value="construction">${this.getTranslation('productTypes.construction') || 'Construction Materials'}</option>
                <option value="aerospace">${this.getTranslation('productTypes.aerospace') || 'Aerospace & Defense'}</option>
                <option value="energy">${this.getTranslation('productTypes.energy') || 'Energy & Utilities'}</option>
                <option value="medical">${this.getTranslation('productTypes.medical') || 'Medical Devices'}</option>
                <option value="plastics">${this.getTranslation('productTypes.plastics') || 'Plastics & Rubber'}</option>
                <option value="paper">${this.getTranslation('productTypes.paper') || 'Paper & Packaging'}</option>
                <option value="other">${this.getTranslation('productTypes.other') || 'Other'}</option>
            `;
            
            industryGroup.replaceChild(industrySelect, industryField);
            this.setupFieldValidation(industrySelect);
            
            // Re-setup the event listener
            industrySelect.addEventListener('change', (e) => this.handleIndustryChange(e));
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Apply RTL if needed
        const isRTL = this.currentLanguage === 'ar';
        const rtlStyle = isRTL ? 'right: auto; left: 20px;' : 'right: 20px; left: auto;';
        
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                ${rtlStyle}
                padding: 16px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                ${type === 'success' ? 'background: #22c55e;' : ''}
                ${type === 'error' ? 'background: #ef4444;' : ''}
                ${type === 'warning' ? 'background: #f59e0b;' : ''}
                ${type === 'info' ? 'background: #3b82f6;' : ''}
                ${isRTL ? 'text-align: right;' : 'text-align: left;'}
            ">
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Global functions for HTML onclick handlers
function resetForm() {
    if (window.factoryForm) {
        window.factoryForm.resetForm();
    }
}

function showForm() {
    if (window.factoryForm) {
        window.factoryForm.showForm();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.factoryForm = new FactoryForm();
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        const form = e.target.closest('form');
        if (form) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.click();
            }
        }
    }
});
