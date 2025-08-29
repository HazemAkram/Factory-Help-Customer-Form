// Factory Form Application - Multi-Language Version
class FactoryForm {
    constructor() {
        this.form = null;
        this.successMessage = null;
        this.map = null;
        this.marker = null;
        this.geocoder = null;
        this.countryCities = this.initializeCountryCities();
        this.ownerIndex = 1;
        this.productionLineIndex = 1;
        
        // Language support
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
        this.loadFormData();
    }

    async loadTranslations() {
        try {
            // Load all translation files
            const [enTranslations, arTranslations] = await Promise.all([
                fetch('translations/en.json').then(res => res.json()),
                fetch('translations/ar.json').then(res => res.json())
            ]);
            
            this.translations = {
                en: enTranslations,
                ar: arTranslations
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
        }
        
        // Set language
        this.setLanguage(detectedLang);
        
        // Update language selector
        if (this.languageSelector) {
            this.languageSelector.value = detectedLang;
        }
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
        
        // Language selector event
        if (this.languageSelector) {
            this.languageSelector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
        
        this.setupDynamicSections();
        this.setupRealTimeValidation();
        this.setupPhoneFormatting();
        this.setupAutoSave();
    }

    // Country-City data mapping
    initializeCountryCities() {
        return {
            'AE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain', 'Khor Fakkan', 'Dibba Al-Fujairah', 'Kalba'],
            'SA': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Tabuk', 'Buraydah', 'Hail', 'Najran', 'Al-Kharj', 'Taif'],
            'EG': ['Cairo', 'Alexandria', 'Giza', 'Shubra El-Kheima', 'Port Said', 'Suez', 'Luxor', 'Aswan', 'Mansoura', 'Tanta', 'Ismailia', 'Faiyum'],
            'IQ': ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Kirkuk', 'Najaf', 'Samarra', 'Karbala', 'Sulaymaniyah', 'Dhi Qar', 'Al Hillah'],
            'JO': ['Amman', 'Zarqa', 'Irbid', 'Aqaba', 'Madaba', 'Mafraq', 'Al Karak', 'Jerash', 'Tafilah', 'Ajloun'],
            'LB': ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Byblos', 'Zahle', 'Baalbek', 'Jounieh', 'Saida', 'Nabatieh'],
            'SY': ['Damascus', 'Aleppo', 'Homs', 'Hama', 'Latakia', 'Deir ez-Zor', 'Raqqa', 'Tartus', 'Qamishli', 'Al Hasakah'],
            'KW': ['Kuwait City', 'Al Ahmadi', 'Hawalli', 'Salmiya', 'Jahra', 'Farwaniya', 'Mangaf', 'Sabah Al Salem'],
            'QA': ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor', 'Al Shamal', 'Mesaieed', 'Umm Salal', 'Al Daayen'],
            'BH': ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Isa Town', 'Sitra', 'Budaiya', 'Zallaq'],
            'OM': ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Bahla', 'Ibra', 'Rustaq', 'Shinas', 'Dhofar'],
            'YE': ['Sana\'a', 'Aden', 'Taiz', 'Al Hudaydah', 'Ibb', 'Mokha', 'Dhamar', 'Lahij', 'Hajjah', 'Saada'],
            'LY': ['Tripoli', 'Benghazi', 'Misrata', 'Bayda', 'Zawiya', 'Sabha', 'Ajdabiya', 'Tobruk', 'Derna', 'Sirte'],
            'TN': ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Sidi Bouzid'],
            'DZ': ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif', 'Sidi Bel Abbès', 'Tlemcen', 'Tizi Ouzou'],
            'MA': ['Rabat', 'Casablanca', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan'],
            'SD': ['Khartoum', 'Omdurman', 'Port Sudan', 'Kassala', 'El-Obeid', 'Al-Fashir', 'Nyala', 'Sennar', 'Wad Madani', 'Kosti'],
            'MR': ['Nouakchott', 'Nouadhibou', 'Atar', 'Zouérat', 'Kiffa', 'Rosso', 'Kaédi', 'Néma', 'Tékane', 'Akjoujt'],
            'SO': ['Mogadishu', 'Hargeisa', 'Bosaso', 'Kismayo', 'Baidoa', 'Berbera', 'Galkayo', 'Marka', 'Burao', 'Erigavo'],
            'DJ': ['Djibouti City', 'Ali Sabieh', 'Tadjoura', 'Obock', 'Dikhil', 'Arta', 'Randa'],
            'KM': ['Moroni', 'Moutsamoudou', 'Fomboni', 'Ouani', 'Dzaoudzi', 'Domoni', 'Itsandra'],
            'PS': ['Ramallah', 'Gaza City', 'Hebron', 'Nablus', 'Bethlehem', 'Jenin', 'Tulkarm', 'Qalqilya', 'Jericho', 'Salfit'],

            'RU': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod', 'Kazan', 'Chelyabinsk', 'Samara', 'Omsk', 'Rostov-on-Don', 'Ufa', 'Krasnoyarsk', 'Perm', 'Voronezh', 'Volgograd'],
            'TR': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Antalya', 'Kayseri', 'Mersin', 'Eskisehir', 'Diyarbakır', 'Samsun', 'Denizli', 'Sanliurfa'],
            'CN': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Tianjin', 'Chongqing', 'Wuhan', 'Xi’an', 'Hangzhou', 'Nanjing', 'Shenyang', 'Harbin', 'Suzhou', 'Qingdao'],
            'IN': ['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Patna'],

            'AL': ['Tirana', 'Durrës', 'Vlorë', 'Shkodër', 'Fier'],
            'AD': ['Andorra la Vella', 'Escaldes-Engordany', 'Encamp', 'Sant Julià de Lòria', 'La Massana'],
            'AT': ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'],
            'BY': ['Minsk', 'Gomel', 'Mogilev', 'Vitebsk', 'Hrodna'],
            'BE': ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège'],
            'BA': ['Sarajevo', 'Banja Luka', 'Tuzla', 'Zenica', 'Mostar'],
            'BG': ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse'],
            'HR': ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar'],
            'CY': ['Nicosia', 'Limassol', 'Larnaca', 'Famagusta', 'Paphos'],
            'CZ': ['Prague', 'Brno', 'Ostrava', 'Plzeň', 'Liberec'],
            'DK': ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg'],
            'EE': ['Tallinn', 'Tartu', 'Narva', 'Pärnu', 'Kohtla-Järve'],
            'FI': ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu'],
            'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'],
            'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt'],
            'GR': ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa'],
            'HU': ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs'],
            'IS': ['Reykjavik', 'Kópavogur', 'Hafnarfjörður', 'Akureyri', 'Reykjanesbær'],
            'IE': ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford'],
            'IT': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo'],
            'LV': ['Riga', 'Daugavpils', 'Liepāja', 'Jelgava', 'Jūrmala'],
            'LI': ['Vaduz', 'Schaan', 'Triesen', 'Balzers', 'Eschen'],
            'LT': ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys'],
            'LU': ['Luxembourg City', 'Esch-sur-Alzette', 'Differdange', 'Dudelange', 'Ettelbruck'],
            'MT': ['Valletta', 'Birkirkara', 'Mosta', 'Qormi', 'Sliema'],
            'MD': ['Chișinău', 'Tiraspol', 'Bălți', 'Bender', 'Rîbnița'],
            'MC': ['Monaco'],
            'ME': ['Podgorica', 'Nikšić', 'Herceg Novi', 'Pljevlja', 'Bijelo Polje'],
            'NL': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
            'MK': ['Skopje', 'Bitola', 'Kumanovo', 'Prilep', 'Tetovo'],
            'NO': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen'],
            'PL': ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań'],
            'PT': ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Funchal'],
            'RO': ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța'],
            'RU': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod'],
            'SM': ['San Marino'],
            'RS': ['Belgrade', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica'],
            'SK': ['Bratislava', 'Košice', 'Prešov', 'Žilina', 'Nitra'],
            'SI': ['Ljubljana', 'Maribor', 'Celje', 'Kranj', 'Velenje'],
            'ES': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza'],
            'SE': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås'],
            'CH': ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne'],
            'TR': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana'],
            'UA': ['Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Lviv'],
            'GB': ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool'],
        };
    }

    setupCountryCityDropdown() {
        const countrySelect = document.getElementById('country');
        const citySelect = document.getElementById('city');
        
        if (!countrySelect || !citySelect) return;
        
        countrySelect.addEventListener('change', (e) => this.handleCountryChange(e));
        citySelect.addEventListener('change', (e) => this.handleCityChange(e));
    }

    handleCountryChange(event) {
        const selectedCountry = event.target.value;
        const citySelect = document.getElementById('city');
        
        // Clear city dropdown
        citySelect.innerHTML = `<option value="">${this.getTranslation('sections.factoryInfo.city.placeholder') || 'Select City'}</option>`;
        citySelect.disabled = true;
        
        if (selectedCountry && selectedCountry !== 'other') {
            const cities = this.countryCities[selectedCountry];
            if (cities) {
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    // Use translation system for city names
                    const translatedCity = this.getTranslation(`cities.${selectedCountry}.${city}`) || city;
                    option.textContent = translatedCity;
                    citySelect.appendChild(option);
                });
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

    replaceCitySelectWithInput() {
        const citySelect = document.getElementById('city');
        const cityGroup = citySelect.parentNode;
        
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.id = 'city';
        textInput.name = 'city';
        textInput.required = true;
        textInput.placeholder = 'Enter city name';
        textInput.maxLength = 100;
        textInput.setAttribute('aria-describedby', 'city-error');
        
        cityGroup.replaceChild(textInput, citySelect);
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
        const ownerPhoneLabel = this.getTranslation('sections.ownerInfo.ownerPhone.label') || 'Mobile Number';
        const removeOwnerText = this.getTranslation('sections.ownerInfo.removeOwner') || 'Remove Owner';
        const ownerNamePlaceholder = this.getTranslation('sections.ownerInfo.ownerName.placeholder') || 'Enter owner name';
        const ownerPhonePlaceholder = this.getTranslation('sections.ownerInfo.ownerPhone.placeholder') || '+1 (555) 123-4567';
        
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
                    <label for="ownerMobile_${index}">${ownerPhoneLabel} <span class="required" aria-label="required">*</span></label>
                    <input 
                        type="tel" 
                        id="ownerMobile_${index}" 
                        name="ownerMobile_${index}" 
                        required
                        aria-describedby="ownerMobile_${index}-error"
                        placeholder="${ownerPhonePlaceholder}"
                        maxlength="20"
                    >
                    <div id="ownerMobile_${index}-error" class="error-message" role="alert" aria-live="polite"></div>
                </div>
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
            const mobileInput = block.querySelector('[id^="ownerMobile_"]');
            const nameLabel = block.querySelector('label[for^="ownerName_"]');
            const mobileLabel = block.querySelector('label[for^="ownerMobile_"]');
            
            if (nameInput) {
                nameInput.id = `ownerName_${index}`;
                nameInput.name = `ownerName_${index}`;
                nameInput.setAttribute('aria-describedby', `ownerName_${index}-error`);
            }
            if (mobileInput) {
                mobileInput.id = `ownerMobile_${index}`;
                mobileInput.name = `ownerMobile_${index}`;
                mobileInput.setAttribute('aria-describedby', `ownerMobile_${index}-error`);
            }
            if (nameLabel) nameLabel.setAttribute('for', `ownerName_${index}`);
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
        const removeProductionLineText = this.getTranslation('sections.productionInfo.removeProductionLine') || 'Remove Production Line';
        
        wrapper.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="productionLine_${index}">${productionLineLabel} <span class="required" aria-label="required">*</span></label>
                    <input 
                        type="text" 
                        id="productionLine_${index}" 
                        name="productionLine_${index}" 
                        placeholder="e.g., Assembly Line A, Manufacturing Unit 1" 
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
                        placeholder="e.g., Brand X, Company Y" 
                        required
                        aria-describedby="brandName_${index}-error"
                        maxlength="100"
                    >
                    <div id="brandName_${index}-error" class="error-message" role="alert" aria-live="polite"></div>
                </div>
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
            const lineLabel = block.querySelector('label[for^="productionLine_"]');
            const brandLabel = block.querySelector('label[for^="brandName_"]');
            
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
            if (lineLabel) lineLabel.setAttribute('for', `productionLine_${index}`);
            if (brandLabel) brandLabel.setAttribute('for', `brandName_${index}`);
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
        
        if (field.type === 'tel' && field.value && !this.isValidPhone(field.value)) {
            this.showFieldError(field, 'Invalid phone number');
            return false;
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

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    setupPhoneFormatting() {
        const phoneFields = this.form.querySelectorAll('input[type="tel"]');
        
        phoneFields.forEach(phoneField => {
            phoneField.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 0) {
                    if (value.length <= 3) {
                        value = `(${value}`;
                    } else if (value.length <= 6) {
                        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                    } else {
                        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                    }
                }
                
                e.target.value = value;
            });
        });
    }

    setupAutoSave() {
        const fields = this.form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            field.addEventListener('input', () => this.saveFormData());
            field.addEventListener('change', () => this.saveFormData());
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
            endpoint: '/api/factory-registration', // Update this to your actual endpoint
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

                return await response.json();
            }
        } catch (error) {
            console.error('Server submission error:', error);
            throw new Error('Failed to connect to server. Please check your internet connection and try again.');
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
