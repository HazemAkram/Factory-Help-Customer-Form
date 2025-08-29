// Simple client-side i18n helper
class I18n {
	constructor() {
		this.supported = ['en', 'tr', 'ar', 'de', 'fr', 'es', 'zh', 'ru', 'hi'];
		this.lang = this.detect();
		this.translations = this.buildTranslations();
		this.applyLangAttributes();
	}

	detect() {
		const saved = localStorage.getItem('lang');
		if (saved && this.supported.includes(saved)) return saved;
		const nav = (navigator.language || 'en').slice(0, 2);
		return this.supported.includes(nav) ? nav : 'en';
	}

	setLanguage(lang) {
		if (!this.supported.includes(lang)) return;
		this.lang = lang;
		localStorage.setItem('lang', lang);
		this.applyLangAttributes();
		this.applyTranslations();
	}

	applyLangAttributes() {
		const isRTL = this.lang === 'ar';
		document.documentElement.lang = this.lang;
		document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
		document.body.classList.toggle('rtl', isRTL);
	}

	t(key) {
		const dict = this.translations[this.lang] || {};
		return key.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : null), dict) ?? key;
	}

	applyTranslations(root = document) {
		root.querySelectorAll('[data-i18n]').forEach(el => {
			const key = el.getAttribute('data-i18n');
			const txt = this.t(key);
			if (txt != null) el.textContent = txt;
		});
		root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
			const key = el.getAttribute('data-i18n-placeholder');
			const txt = this.t(key);
			if (txt != null) el.setAttribute('placeholder', txt);
		});
		root.querySelectorAll('option[data-i18n]').forEach(opt => {
			const key = opt.getAttribute('data-i18n');
			const txt = this.t(key);
			if (txt != null) opt.textContent = txt;
		});
		const titleTxt = this.t('app.pageTitle');
		if (titleTxt && document.title !== titleTxt) document.title = titleTxt;
	}

	buildTranslations() {
		return {
			en: {
				app: { pageTitle: 'Factory Information Form', logo: 'Website Opening Form', title: 'Factory Registration Form', subtitle: 'Please provide your factory details below for registration and integration purposes.', language: 'Language' },
				section: { factoryInfo: 'Factory Information', factoryOwnerInfo: 'Factory Owner Information', sparePartsManger: 'Spare Parts Manger', industrilaActivity: 'Industrial Activity', termsAndConditions: 'Terms & Conditions'},
				field: { factoryName: 'Factory Name', country: 'Country',city: 'city',detailedAddress: 'Detailed Address',landLinePhone: 'Landline Phone',factoryEmail: 'Email (for website integration)' ,ownerName: 'Owner Name', mobileNumber: 'Mobile Number',mangerName: 'Name',email:'Email',avProdLinesAndBrands: 'Available Produciton Lines & Brands',industryField:'Industry Field', productionLine: 'Production Line', brandName: 'Brand Name', prodLineDate: 'Produciton Lines Manufacturing Date' },
				select: { countryPlaceholder: 'Select Country', cityPlaceholder: 'Select Country First', city: 'Select City', otherSpecify: 'Other (Please specify)', industryPlaceholder: 'Select Industry Field' },
				placeholder: { factoryName: 'Enter factory name', detailedAddress: 'Street address, building number, floor, etc.', ownerName: 'Enter owner name', mangerName: 'Enter Manger Name', productionLine: 'e.g., Assembly Line A, Manufacturing Unit 1', brandName: 'e.g., Brand X, Company Y', cityName: 'Enter city name' },
				map: { currentLocation: 'Current Location', searchAddress: 'Search Address', apiNeeded: 'Google Maps integration requires a valid API key', updateKey: 'Please update the API key in the HTML file' },
				actions: { reset: 'Reset Form', submit: 'Submit Factory Information', removingLine: 'Remove Production Line', addLine: 'Add Production Line',addOwner: 'Add Owner',removingOwner: 'Remove Owner', submitting: 'Submitting...', removeOwner: 'Remove Owner', removeLine: 'Remove Production Line' },
				validate: { required: 'This field is required', email: 'Please enter a valid email address', phone: 'Please enter a valid phone number' },
				geo: { notSupported: 'Geolocation is not supported by this browser.', prompt: 'Enter an address to search:', geocodeFail: 'Geocode was not successful: {status}', markerTitle: 'Selected Location' },
				reset: { confirm: 'Are you sure you want to reset the form? All entered data will be lost.', done: 'Form has been reset successfully.' },
				submit: { successToast: 'Form submitted successfully! Submission ID: {id}', fail: 'Submission failed: {msg}. Please try again.' },
				success: { title: 'Thank You!', desc: "Your factory information has been submitted successfully. We'll review and get back to you soon!", submitAnother: 'Submit Another' },
                termsAndConditions: {desc: "The customer is deemed to have accepted the terms of the privacy policy and the terms of use of the company's website and undertakes to maintain the confidentiality of data and not to leak any of it to third parties under any circumstances during the period granted to him to browse the website's data, which is specified as one month from the date of his entry to the website. The company is committed to maintaining the confidentiality of customer data in accordance with the rules of electronic commerce, the European Data Protection Regulation, and the UNCITRAL rules." }
			},
			tr: {
				app: { pageTitle: 'Fabrika Bilgi Formu', logo: 'Web Sitesi Açılış Formu', title: 'Fabrika Kayıt Formu', subtitle: 'Lütfen kayıt ve entegrasyon için aşağıdaki fabrika bilgilerini sağlayın.', language: 'Dil' },
				section: { factoryInfo: 'Fabrika Bilgileri', factoryOwnerInfo: 'Fabrika Sahibi Bilgileri', sparePartsManger: 'Yedek Parça Yöneticisi', industrilaActivity: 'Endüstriyel Aktivite', termsAndConditions: 'Şartlar ve Koşullar' },
				field: { factoryName: 'Fabrika Adı', country: 'Ülke',city: "şhıre",detailedAddress: 'Açık Adres',landLinePhone:'Telefon',factoryEmail:'eposta (web sitesi entegrasyonu için)',ownerName: 'Sahip Adı', mobileNumber: 'Cep Telefonu',mangerName: 'Adı',email:'eposta',avProdLinesAndBrands: 'Mevcut Üretim Hattı ve Markalar',industryField:'Endüstri Alanı', productionLine: 'Üretim Hattı', brandName: 'Marka Adı', prodLineDate: 'Üretim Hattı Üretim Tarihi' },
				select: { countryPlaceholder: 'Ülke Seçin', cityPlaceholder: 'Önce Ülke Seçin', city: 'Şehir Seçin', otherSpecify: 'Diğer (Lütfen belirtin)' },
				placeholder: { factoryName: 'Fabrika adını girin', detailedAddress: 'Sokak, bina numarası, kat vb.', ownerName: 'Sahip adını girin', mangerName: 'Yönetici adını girin',productionLine: 'Örn. Montaj Hattı A, Ünite 1', brandName: 'Örn. Marka X, Şirket Y', cityName: 'Şehir adını girin' },
				map: { currentLocation: 'Mevcut Konum', searchAddress: 'Adres Ara', apiNeeded: 'Google Haritalar için geçerli bir API anahtarı gerekir', updateKey: 'Lütfen HTML dosyasındaki API anahtarını güncelleyin' },
				actions: { reset: 'Formu Sıfırla', submit: 'Fabrika Bilgilerini Gönder',  addOwner: 'Sahibi Ekle',addLine: 'Üretim Hattı Ekle', removingOwner: 'Sahibi Kaldır', removingLine: 'Üretim Hattını Kaldır', submitting: 'Gönderiliyor...', removeOwner: 'Sahibi Kaldır', removeLine: 'Üretim Hattını Kaldır' },
				validate: { required: 'Bu alan zorunludur', email: 'Geçerli bir e-posta adresi girin', phone: 'Geçerli bir telefon numarası girin' },
				geo: { notSupported: 'Konum hizmeti bu tarayıcıda desteklenmiyor.', prompt: 'Aranacak adresi girin:', geocodeFail: 'Coğrafi kodlama başarısız: {status}', markerTitle: 'Seçilen Konum' },
				reset: { confirm: 'Formu sıfırlamak istediğinizden emin misiniz? Tüm veriler silinecek.', done: 'Form başarıyla sıfırlandı.' },
				submit: { successToast: 'Form başarıyla gönderildi! Gönderim No: {id}', fail: 'Gönderim başarısız: {msg}. Lütfen tekrar deneyin.' },
				success: { title: 'Teşekkürler!', desc: 'Fabrika bilgileriniz başarıyla gönderildi. En kısa sürede size geri döneceğiz!', submitAnother: 'Bir Tane Daha Gönder' },
                termsAndConditions: {desc: "Müşteri, şirketin internet sitesine ilişkin gizlilik politikası ve kullanım koşullarını kabul etmiş sayılır ve kendisine internet sitesinin verilerini incelemesi için tanınan süre boyunca – ki bu süre siteye giriş tarihinden itibaren bir ay olarak belirlenmiştir – verilerin gizliliğini korumayı, hiçbir koşulda üçüncü kişilere aktarmamayı taahhüt eder. Şirket ise müşteri verilerinin gizliliğini, elektronik ticaret kuralları, Avrupa Veri Koruma Tüzüğü ve UNCITRAL kuralları çerçevesinde korumayı taahhüt eder."}
			},
			ar: {
				app: { pageTitle: 'نموذج معلومات المصنع', logo: 'نموذج فتح الموقع', title: 'نموذج تسجيل المصنع', subtitle: 'يرجى تزويدنا بتفاصيل المصنع أدناه لغرض التسجيل والدمج.', language: 'اللغة' },
				section: { factoryInfo: 'معلومات المصنع', factoryOwnerInfo: 'معلومات المالك', sparePartsManger: 'مدير القطع الغيار', industrilaActivity: 'النشاط الصناعي', termsAndConditions: 'الشروط والأحكام' },
				field: { factoryName: 'اسم المصنع', country: 'البلد',city: 'المدينة',detailedAddress: 'العنوان المفصل',landLinePhone: 'الهاتف الثابت',factoryEmail: 'البريد الإلكتروني (لدمج الموقع)',ownerName: 'اسم المالك', mobileNumber: 'رقم الجوال',mangerName: 'اسم المدير',email:'البريد الإلكتروني',avProdLinesAndBrands: 'خطوط الإنتاج المتاحة والعلامات التجارية',industryField: 'المجال الصناعي', productionLine: 'خط الإنتاج', brandName: 'اسم العلامة التجارية', prodLineDate: 'تاريخ إنتاج خطوط الإنتاج' },
				select: { countryPlaceholder: 'اختر البلد', cityPlaceholder: 'اختر البلد أولاً', city: 'اختر المدينة', otherSpecify: 'أخرى (يرجى التحديد)' },
				placeholder: { factoryName: 'أدخل اسم المصنع', detailedAddress: 'العنوان، رقم المبنى، الطابق، إلخ.', ownerName: 'أدخل اسم المالك', mangerName: 'أدخل اسم المدير',   productionLine: 'مثال: خط التجميع A، الوحدة 1', brandName: 'مثال: العلامة X، الشركة Y', cityName: 'أدخل اسم المدينة' },
				map: { currentLocation: 'الموقع الحالي', searchAddress: 'بحث عن عنوان', apiNeeded: 'تتطلب خرائط Google مفتاح API صالحًا', updateKey: 'يرجى تحديث مفتاح API في ملف HTML' },
				actions: { reset: 'إعادة تعيين النموذج', submit: 'إرسال معلومات المصنع', addOwner: 'إضافة مالك', addLine: 'إضافة خط إنتاج', removingOwner: 'حذف المالك', removingLine: 'حذف خط إنتاج', submitting: 'جارٍ الإرسال...', removeOwner: 'حذف المالك', removeLine: 'حذف خط إنتاج' },
				validate: { required: 'هذه الخانة مطلوبة', email: 'يرجى إدخال بريد إلكتروني صالح', phone: 'يرجى إدخال رقم هاتف صالح' },
				geo: { notSupported: 'خدمة تحديد الموقع غير مدعومة في هذا المتصفح.', prompt: 'أدخل عنوانًا للبحث:', geocodeFail: 'فشل تحديد الموقع الجغرافي: {status}', markerTitle: 'الموقع المحدد' },
				reset: { confirm: 'هل أنت متأكد من إعادة تعيين النموذج؟ سيتم فقدان جميع البيانات.', done: 'تمت إعادة تعيين النموذج بنجاح.' },
				submit: { successToast: 'تم إرسال النموذج بنجاح! رقم الإرسال: {id}', fail: 'فشل الإرسال: {msg}. يرجى المحاولة مرة أخرى.' },
				success: { title: 'شكراً لك!', desc: 'تم إرسال معلومات المصنع بنجاح. سنراجع ونعاود الاتصال بك قريباً!', submitAnother: 'إرسال آخر' },
                termsAndConditions: {desc: "يعتبر الزبون قابلا بشروط سياسة الخصوصية وشروط الاستخدام لموقع الشركة الالكتروني ويتعهد بالمحافظة على سربة البيانات وعدم تسريب اي منها للغير تحت أي ظرف خلال المدة الممنوحة له لتصفح بيانات الموقع والمحددة بشهر واحد من تاريخ دخوله للموقع .وتلتزم الشركة بالمحافظة على سرية بيانات الزبون وفقا لقواعد التجارة الالكترونية  واللائحة الاوربية لحماية البيانات وقواعد الاونسيترال"}
			},
			de: { 
                app: { pageTitle: 'Fabrikainformationsformular', logo: 'Website-Eröffnungsformular', title: 'Fabrik-Registrierungsformular', subtitle: 'Bitte geben Sie unten Ihre Fabrikdaten für Registrierung und Integration an.', language: 'Sprache' }, 
                section: { factoryInfo: 'Fabrik-Informationen', factoryOwnerInfo: 'Fabrik-Eigentümer-Informationen', sparePartsManger: 'Ersatzteil-Manager', industrilaActivity: 'Industrieaktivität', termsAndConditions: 'Allgemeine Geschäftsbedingungen' }, 
                field: { factoryName: 'Name der Fabrik', country: 'Land', city: 'Stadt', detailedAddress: 'Ausführliche Adresse', landLinePhone: 'Festnetztelefon', factoryEmail: 'E-Mail (für Website-Integration)', ownerName: 'Name des Eigentümers', mobileNumber: 'Mobilnummer', mangerName: 'Name', email: 'E-Mail', avProdLinesAndBrands: 'Verfügbare Produktionslinien und Marken', industryField: 'Branche', productionLine: 'Produktionslinie', brandName: 'Markenname', prodLineDate: 'Produktionslinien-Herstellungsdatum' }, 
                select: { countryPlaceholder: 'Land wählen', cityPlaceholder: 'Zuerst Land wählen', city: 'Stadt wählen', otherSpecify: 'Andere (bitte angeben)' }, 
                placeholder: { factoryName: 'Fabriknamen eingeben', detailedAddress: 'Straße, Hausnummer, Etage usw.', ownerName: 'Eigentümernamen eingeben', mangerName: 'Name eingeben', productionLine: 'z. B. Montageband A, Einheit 1', brandName: 'z. B. Marke X, Firma Y', cityName: 'Stadtnamen eingeben' }, 
                map: { currentLocation: 'Aktueller Standort', searchAddress: 'Adresse suchen', apiNeeded: 'Google Maps erfordert einen gültigen API-Schlüssel', updateKey: 'Bitte API-Schlüssel in der HTML-Datei aktualisieren' }, 
                actions: { reset: 'Formular zurücksetzen', submit: 'Fabrikdaten senden', addOwner: 'Eigentümer hinzufügen', addLine: 'Produktionslinie hinzufügen', removingOwner: 'Eigentümer entfernen', removingLine: 'Produktionslinie entfernen', submitting: 'Wird gesendet...', removeOwner: 'Eigentümer entfernen', removeLine: 'Produktionslinie entfernen' }, 
                validate: { required: 'Dieses Feld ist erforderlich', email: 'Bitte gültige E-Mail-Adresse eingeben', phone: 'Bitte gültige Telefonnummer eingeben' }, 
                geo: { notSupported: 'Standortbestimmung wird vom Browser nicht unterstützt.', prompt: 'Adresse zum Suchen eingeben:', geocodeFail: 'Geokodierung nicht erfolgreich: {status}', markerTitle: 'Ausgewählter Standort' }, 
                reset: { confirm: 'Formular wirklich zurücksetzen? Alle Daten gehen verloren.', done: 'Formular wurde zurückgesetzt.' }, 
                submit: { successToast: 'Erfolgreich gesendet! Vorgangs-ID: {id}', fail: 'Senden fehlgeschlagen: {msg}. Bitte erneut versuchen.' }, 
                success: { title: 'Danke!', desc: 'Ihre Daten wurden erfolgreich gesendet. Wir melden uns in Kürze!', submitAnother: 'Noch einmal senden' },
                termsAndConditions: {desc: "Der Kunde wird als zugestimmt angesehen, dass er die Datenschutzrichtlinie und die Nutzungsbedingungen für die Website der Firma akzeptiert und sich verpflichtet, die Daten vertraulich zu halten und sie keinesfalls an Dritte zu verleiten, während er die Website besucht, wobei die Dauer für die Anzeige der Daten durch die Firma als ein Monat ab dem Tag seines Eintritts in die Website festgelegt wird. Die Firma verpflichtet sich, die Daten des Kunden vertraulich zu halten und gemäß den Regeln des elektronischen Handels, der europäischen Datenschutzverordnung und den UNCITRAL-Regeln zu handeln."}
            },
			fr: { 
                app: { pageTitle: 'Formulaire d’informations de l’usine', logo: 'Formulaire d’ouverture du site', title: 'Formulaire d’enregistrement de l’usine', subtitle: 'Veuillez fournir les détails de votre usine pour l’enregistrement et l’intégration.', language: 'Langue' }, 
                section: { factoryInfo: 'Informations sur l’usine', factoryOwnerInfo: 'Informations sur le propriétaire', sparePartsManger: 'Gestionnaire des pièces de rechange', industrilaActivity: 'Activité industrielle', termsAndConditions: 'Conditions générales' }, 
                field: { factoryName: 'Nom de l’usine', country: 'Pays', city: 'Ville', detailedAddress: 'Adresse détaillée', landLinePhone: 'Téléphone fixe', factoryEmail: 'E-mail (pour l’intégration du site web)', ownerName: 'Nom du propriétaire', mobileNumber: 'Numéro de mobile', mangerName: 'Nom', email: 'E-mail', avProdLinesAndBrands: 'Lignes de production disponibles et marques', industryField: 'Branche', productionLine: 'Ligne de production', brandName: 'Nom de la marque', prodLineDate: 'Date de fabrication des lignes de production' }, 
                select: { countryPlaceholder: 'Sélectionner un pays', cityPlaceholder: 'Sélectionnez d’abord un pays', city: 'Sélectionnez une ville', otherSpecify: 'Autre (veuillez préciser)' }, 
                placeholder: { factoryName: 'Entrez le nom de l’usine', detailedAddress: 'Adresse, numéro du bâtiment, étage, etc.', ownerName: 'Entrez le nom du propriétaire', mangerName: 'Entrez le nom du gestionnaire', productionLine: 'ex. Ligne d’assemblage A, Unité 1', brandName: 'ex. Marque X, Société Y', cityName: 'Entrez le nom de la ville' }, 
                map: { currentLocation: 'Position actuelle', searchAddress: 'Rechercher une adresse', apiNeeded: 'Google Maps nécessite une clé API valide', updateKey: 'Veuillez mettre à jour la clé API dans le fichier HTML' }, 
                actions: { reset: 'Réinitialiser le formulaire', submit: 'Envoyer les informations', addOwner: 'Ajouter le propriétaire', addLine: 'Ajouter la ligne de production', removingOwner: 'Supprimer le propriétaire', removingLine: 'Supprimer la ligne de production', submitting: 'Envoi…', removeOwner: 'Supprimer le propriétaire', removeLine: 'Supprimer la ligne de production' }, 
                validate: { required: 'Ce champ est requis', email: 'Veuillez saisir une adresse e-mail valide', phone: 'Veuillez saisir un numéro de téléphone valide' }, 
                geo: { notSupported: 'La géolocalisation n’est pas prise en charge par ce navigateur.', prompt: 'Entrez une adresse à rechercher :', geocodeFail: 'Échec du géocodage : {status}', markerTitle: 'Emplacement sélectionné' }, 
                reset: { confirm: 'Réinitialiser le formulaire ? Toutes les données seront perdues.', done: 'Formulaire réinitialisé avec succès.' }, 
                submit: { successToast: 'Formulaire envoyé ! ID : {id}', fail: 'Échec de l’envoi : {msg}. Veuillez réessayer.' }, 
                success: { title: 'Merci !', desc: 'Vos informations ont été envoyées. Nous vous répondrons bientôt !', submitAnother: 'Envoyer un autre' },
                termsAndConditions: {desc: "Le client est considéré comme ayant accepté les conditions de la politique de confidentialité et les conditions d’utilisation du site web de la société et s’engage à maintenir la confidentialité des données et à ne pas les divulguer à des tiers sous aucune circonstance pendant la période accordée à son accès aux données du site web, qui est fixée à un mois à compter du jour de son entrée sur le site web. La société s’engage à maintenir la confidentialité des données du client conformément aux règles du commerce électronique, à la réglementation européenne sur la protection des données et aux règles de l’Organisation des Nations Unies pour le commerce international."}
            },
			zh: { 
                app: { pageTitle: '工厂信息表', logo: '网站开通表', title: '工厂注册表', subtitle: '请填写下方工厂信息以便注册与集成。', language: '语言' }, 
                section: { factoryInfo: '工厂信息', factoryOwnerInfo:'工厂主信息', sparePartsManger: '备件经理', industrilaActivity:'工业活动', termsAndConditions: '条款和条件'}, 
                field: { factoryName: '工厂名称', country: '国家', city: '城市', ownerName: '所有者姓名', mobileNumber: '手机号码',detailedAddress:'详细地址', landLinePhone: '固定电话', factoryEmail: '电子邮件（用于网站集成）',mangerName:'经理姓名',industryField:'行业领域',avProdLinesAndBrands:'现有生产线和品牌', productionLine: '生产线', brandName: '品牌名称',prodLineDate:'生产线制造日期' }, 
                select: { countryPlaceholder: '选择国家', cityPlaceholder: '请先选择国家', city: '选择城市', otherSpecify: '其他（请说明）', industryPlaceholder: '选择行业领域' }, 
                placeholder: { factoryName: '输入工厂名称', detailedAddress: '街道、门牌号、楼层等', ownerName: '输入所有者姓名', productionLine: '如：装配线A，单元1', brandName: '如：品牌X，公司Y', cityName: '输入城市名称', mangerName:'输入经理姓名'}, 
                map: { currentLocation: '当前位置', searchAddress: '搜索地址', apiNeeded: 'Google 地图需要有效的 API 密钥', updateKey: '请在 HTML 文件中更新 API 密钥' }, 
                actions: { reset: '重置表单', submit: '提交工厂信息', removingOwnerBlocked: '至少需要一位所有者。', removingLineBlocked: '至少需要一条生产线。', submitting: '提交中…',addOwner : '添加所有者', removeOwner: '删除所有者', removeLine: '删除生产线', addLine:'新增生产线'}, 
                validate: { required: '此字段为必填', email: '请输入有效的邮箱地址', phone: '请输入有效的电话号码' }, 
                geo: { notSupported: '此浏览器不支持地理定位。', prompt: '输入要搜索的地址：', geocodeFail: '地理编码失败：{status}', markerTitle: '选择位置' }, 
                reset: { confirm: '确定要重置表单吗？所有数据将丢失。', done: '表单已成功重置。' }, 
                submit: { successToast: '表单提交成功！提交编号：{id}', fail: '提交失败：{msg}。请重试。' }, 
                success: { title: '谢谢！', desc: '您的信息已成功提交，我们会尽快联系您！', submitAnother: '再次提交' },
                termsAndConditions: {desc: "客户被视为已接受公司的隐私政策和使用条款，并承诺维护数据的机密性，不得将任何数据泄露给第三方，无论在任何情况下，在公司授予其浏览网站数据期间，该期间被指定为网站访问之日起一个月。公司承诺根据电子贸易规则、欧洲数据保护法规和UNCITRAL规则维护客户数据的机密性。"} 
            
            },
			ru: { 
                app: { pageTitle: 'Форма информации о заводе', logo: 'Форма открытия сайта', title: 'Форма регистрации завода', subtitle: 'Пожалуйста, укажите данные завода для регистрации и интеграции.', language: 'Язык' }, 
                section: { factoryInfo: 'Информация о заводе', factoryOwnerInfo: 'Информация о владельце', sparePartsManger: 'Менеджер запасных частей', industrilaActivity: 'Промышленная деятельность', termsAndConditions: 'Общие условия' }, 
                field: { factoryName: 'Название завода', country: 'Страна', city: 'Город', detailedAddress: 'Подробный адрес', landLinePhone: 'Телефон', factoryEmail: 'Электронная почта (для интеграции сайта)', ownerName: 'Имя владельца', mobileNumber: 'Мобильный номер', mangerName: 'Имя', email: 'Электронная почта', avProdLinesAndBrands: 'Доступные производственные линии и бренды', industryField: 'Промышленная область', productionLine: 'Производственная линия', brandName: 'Название бренда', prodLineDate: 'Дата производства производственных линий' }, 
                select: { countryPlaceholder: 'Выберите страну', cityPlaceholder: 'Сначала выберите страну', city: 'Выберите город', otherSpecify: 'Другое (уточните)', industryPlaceholder: 'Выберите промышленную область' }, 
                placeholder: { factoryName: 'Введите название завода', detailedAddress: 'Улица, дом, этаж и т. д.', ownerName: 'Введите имя владельца', mangerName: 'Введите имя', productionLine: 'напр.: Линия A, Узел 1', brandName: 'напр.: Бренд X, Компания Y', cityName: 'Введите название города' }, 
                map: { currentLocation: 'Текущее местоположение', searchAddress: 'Поиск адреса', apiNeeded: 'Для Google Maps требуется действительный ключ API', updateKey: 'Обновите ключ API в HTML-файле' }, 
                actions: { reset: 'Сбросить форму', submit: 'Отправить информацию', addOwner: 'Добавить владельца', addLine: 'Добавить производственную линию', removingOwner: 'Удалить владельца', removingLine: 'Удалить производственную линию', submitting: 'Отправка…', removeOwner: 'Удалить владельца', removeLine: 'Удалить производственную линию' }, 
                validate: { required: 'Поле обязательно', email: 'Введите корректный email', phone: 'Введите корректный телефон' }, 
                geo: { notSupported: 'Геолокация не поддерживается браузером.', prompt: 'Введите адрес для поиска:', geocodeFail: 'Геокодирование не удалось: {status}', markerTitle: 'Выбранное место' }, 
                reset: { confirm: 'Сбросить форму? Все данные будут потеряны.', done: 'Форма успешно сброшена.' }, 
                submit: { successToast: 'Форма отправлена! ID: {id}', fail: 'Ошибка отправки: {msg}. Попробуйте снова.' }, 
                success: { title: 'Спасибо!', desc: 'Информация успешно отправлена. Мы свяжемся с вами в ближайшее время!', submitAnother: 'Отправить ещё' },
                termsAndConditions: {desc: "Клиент считается принявшим условия политики конфиденциальности и условия использования сайта компании и обязуется сохранять конфиденциальность данных, не раскрывать их третьим лицам ни при каких обстоятельствах в течение предоставленного ему периода для ознакомления с данными сайта, который составляет один месяц с даты его входа на сайт. Компания, в свою очередь, обязуется обеспечивать конфиденциальность данных клиента в соответствии с правилами электронной коммерции, Общим регламентом по защите данных (GDPR) и правилами ЮНСИТРАЛ."}
            },
			es: { 
                app: { pageTitle: 'Formulario de Información de Fábrica', logo: 'Formulario de Apertura del Sitio Web', title: 'Formulario de Registro de Fábrica', subtitle: 'Por favor proporcione los detalles de su fábrica a continuación para el registro y la integración.', language: 'Idioma' }, 
                section: { factoryInfo: 'Información de la Fábrica', factoryOwnerInfo: 'Información del Propietario de la Fábrica', sparePartsManger: 'Gerente de Repuestos', industrilaActivity: 'Actividad Industrial', termsAndConditions: 'Términos y Condiciones' }, 
                field: { factoryName: 'Nombre de la Fábrica', country: 'País', city: 'Ciudad', detailedAddress: 'Dirección Detallada', landLinePhone: 'Teléfono Fijo', factoryEmail: 'Correo Electrónico (para integración del sitio web)', ownerName: 'Nombre del Propietario', mobileNumber: 'Número Móvil', mangerName: 'Nombre', email: 'Correo Electrónico', avProdLinesAndBrands: 'Líneas de Producción Disponibles y Marcas', industryField: 'Campo Industrial', productionLine: 'Línea de Producción', brandName: 'Nombre de la Marca', prodLineDate: 'Fecha de Fabricación de Líneas de Producción' }, 
                select: { countryPlaceholder: 'Seleccionar País', cityPlaceholder: 'Seleccionar País Primero', city: 'Seleccionar Ciudad', otherSpecify: 'Otro (Por favor especifique)', industryPlaceholder: 'Seleccionar Campo Industrial' }, 
                placeholder: { factoryName: 'Ingrese el nombre de la fábrica', detailedAddress: 'Dirección de la calle, número del edificio, piso, etc.', ownerName: 'Ingrese el nombre del propietario', mangerName: 'Ingrese el nombre del gerente', productionLine: 'ej. Línea de Ensamblaje A, Unidad 1', brandName: 'ej. Marca X, Empresa Y', cityName: 'Ingrese el nombre de la ciudad' }, 
                map: { currentLocation: 'Ubicación Actual', searchAddress: 'Buscar Dirección', apiNeeded: 'Google Maps requiere una clave API válida', updateKey: 'Por favor actualice la clave API en el archivo HTML' }, 
                actions: { reset: 'Restablecer Formulario', submit: 'Enviar Información de la Fábrica', addOwner: 'Agregar Propietario', addLine: 'Agregar Línea de Producción', removingOwner: 'Eliminar Propietario', removingLine: 'Eliminar Línea de Producción', submitting: 'Enviando...', removeOwner: 'Eliminar Propietario', removeLine: 'Eliminar Línea de Producción' }, 
                validate: { required: 'Este campo es obligatorio', email: 'Por favor ingrese una dirección de correo electrónico válida', phone: 'Por favor ingrese un número de teléfono válido' }, 
                geo: { notSupported: 'La geolocalización no es compatible con este navegador.', prompt: 'Ingrese una dirección para buscar:', geocodeFail: 'La geocodificación no fue exitosa: {status}', markerTitle: 'Ubicación Seleccionada' }, 
                reset: { confirm: '¿Está seguro de que desea restablecer el formulario? Todos los datos ingresados se perderán.', done: 'El formulario ha sido restablecido exitosamente.' }, 
                submit: { successToast: '¡Formulario enviado exitosamente! ID de envío: {id}', fail: 'El envío falló: {msg}. Por favor inténtelo de nuevo.' }, 
                success: { title: '¡Gracias!', desc: '¡Su información de fábrica ha sido enviada exitosamente! Revisaremos y nos pondremos en contacto con usted pronto.', submitAnother: 'Enviar Otro' },
                termsAndConditions: {desc: "Se considera que el cliente ha aceptado los términos de la política de privacidad y las condiciones de uso del sitio web de la empresa, y se compromete a mantener la confidencialidad de los datos y a no divulgarlos a terceros bajo ninguna circunstancia durante el período que se le concede para consultar la información del sitio web, el cual se establece en un mes a partir de la fecha de su acceso al mismo. La empresa, por su parte, se compromete a preservar la confidencialidad de los datos del cliente de conformidad con las normas de comercio electrónico, el Reglamento Europeo de Protección de Datos (GDPR) y las normas de la CNUDMI (UNCITRAL)."}
            },
			hi: { 
                app: { pageTitle: 'फैक्ट्री सूचना फॉर्म', logo: 'वेबसाइट खोलने का फॉर्म', title: 'फैक्ट्री पंजीकरण फॉर्म', subtitle: 'कृपया पंजीकरण और एकीकरण हेतु विवरण भरें.', language: 'भाषा' }, 
                section: { factoryInfo: 'फैक्ट्री जानकारी', factoryOwnerInfo: 'फैक्ट्री मालिक',sparePartsManger:'स्पेयर पार्ट्स मैनेजर', industrilaActivity:'औद्योगिक गतिविधि', termsAndConditions:'नियम और शर्तें' }, 
                field: { factoryName: 'फैक्ट्री नाम', country: 'देश',city:'शहर',landLinePhone:'लैंडलाइन फोन',detailedAddress:'विस्तृत पता',factoryEmail:'ईमेल (वेबसाइट एकीकरण के लिए)', ownerName: 'मालिक का नाम', mobileNumber: 'मोबाइल नंबर',mangerName:'चरनी का नाम',industryField:'उद्योग क्षेत्र', avProdLinesAndBrands: 'उपलब्ध उत्पादन लाइनें और ब्रांड',email:'ईमेल',productionLine: 'उत्पादन लाइन', brandName: 'ब्रांड नाम',prodLineDate:'उत्पादन लाइनें निर्माण तिथि' }, 
                select: { countryPlaceholder: 'देश चुनें', cityPlaceholder: 'पहले देश चुनें', city: 'शहर चुनें', otherSpecify: 'अन्य (कृपया बताएं)', industryPlaceholder:'उद्योग का चयन करें'}, 
                placeholder: { factoryName: 'फैक्ट्री का नाम दर्ज करें', detailedAddress: 'पता, भवन संख्या, मंज़िल आदि', ownerName: 'मालिक का नाम दर्ज करें',mangerName:'चरनी का नाम', productionLine: 'उदाहरण: असेंबली लाइन A, यूनिट 1', brandName: 'उदाहरण: ब्रांड X, कंपनी Y', cityName: 'शहर का नाम दर्ज करें' }, 
                map: { currentLocation: 'वर्तमान स्थान', searchAddress: 'पता खोजें', apiNeeded: 'Google Maps के लिए मान्य API कुंजी आवश्यक है', updateKey: 'कृपया HTML फ़ाइल में API कुंजी अपडेट करें' }, 
                actions: { reset: 'फॉर्म रीसेट करें', submit: 'फैक्ट्री जानकारी सबमिट करें', removingOwnerBlocked: 'कम से कम एक मालिक आवश्यक है.', removingLineBlocked: 'कम से कम एक उत्पादन लाइन आवश्यक है.', submitting: 'सबमिट किया जा रहा है…', removeOwner: 'मालिक हटाएं', removeLine: 'लाइन हटाएं', addOwner:'स्वामी जोड़ें', addLine:'उत्पादन लाइन जोड़ें' }, 
                validate: { required: 'यह फ़ील्ड आवश्यक है', email: 'कृपया मान्य ईमेल दर्ज करें', phone: 'कृपया मान्य फोन नंबर दर्ज करें' }, 
                geo: { notSupported: 'यह ब्राउज़र जियोलोकेशन सपोर्ट नहीं करता.', prompt: 'खोजने के लिए पता दर्ज करें:', geocodeFail: 'जियोकोड असफल: {status}', markerTitle: 'चयनित स्थान' }, 
                reset: { confirm: 'क्या आप फॉर्म रीसेट करना चाहते हैं? सभी डेटा मिट जाएगा.', done: 'फॉर्म सफलतापूर्वक रीसेट किया गया.' }, 
                submit: { successToast: 'फॉर्म सफलतापूर्वक सबमिट! सबमिशन आईडी: {id}', fail: 'सबमिशन विफल: {msg}. कृपया पुनः प्रयास करें.' }, 
                success: { title: 'धन्यवाद!', desc: 'आपकी जानकारी सफलतापूर्वक भेज दी गई है. हम जल्द संपर्क करेंगे!', submitAnother: 'एक और सबमिट करें' },
                termsAndConditions: {desc:'ग्राहक को कंपनी की वेबसाइट की गोपनीयता नीति और उपयोग की शर्तों को स्वीकार किया हुआ माना जाएगा तथा वह इस बात के लिए बाध्य होगा कि उसे वेबसाइट के डेटा को देखने के लिए दी गई अवधि के दौरान — जो कि वेबसाइट में प्रवेश की तिथि से एक माह निर्धारित है — डेटा की गोपनीयता बनाए रखे और किसी भी परिस्थिति में उसे किसी तृतीय पक्ष के साथ साझा न करे। कंपनी ग्राहक के डेटा की गोपनीयता को ई-कॉमर्स नियमों, यूरोपीय डेटा संरक्षण विनियम (GDPR) तथा UNCITRAL नियमों के अनुसार बनाए रखने के लिए प्रतिबद्ध है।'}
            }
		};
	}
}

window.I18n = I18n;


