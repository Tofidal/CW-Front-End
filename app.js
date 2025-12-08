<<<<<<< HEAD
import { createApp } from 'vue';
import App from './App.vue';
import './assets/styles.css';

createApp(App).mount('#app');
=======
const { createApp } = Vue;

createApp({
  data() {
    return {
      loggedIn: false,
      username: '',
      role: '',
      lessons: [],       // loaded from backend
      searchText: '',
      sortBy: '',
      sortDir: 'asc',
      cart: [],
      showingCart: false,
      checkoutName: '',
      checkoutPhone: '',
      orderMessage: '',
      searchTimer: null,
      apiBase: 'https://cw-back-end.onrender.com/' // if you host API on another domain, replace with full URL like 'https://your-api.onrender.com/api'
    };
  },

  computed: {
    displayedLessons() {
      let arr = [...this.lessons];
      if (this.sortBy) {
        arr.sort((a,b) => {
          let av = a[this.sortBy], bv = b[this.sortBy];
          if (typeof av === 'string') av = av.toLowerCase();
          if (typeof bv === 'string') bv = bv.toLowerCase();
          if (av < bv) return this.sortDir==='asc' ? -1 : 1;
          if (av > bv) return this.sortDir==='asc' ? 1 : -1;
          return 0;
        });
      }
      return arr;
    },

    cartTotal() {
      return this.cart.reduce((s, it) => s + Number(it.price), 0);
    },

    canCheckout() {
      const nameOK = /^[A-Za-z\s]+$/.test(this.checkoutName);
      const phoneOK = /^\d+$/.test(this.checkoutPhone);
      return this.cart.length>0 && nameOK && phoneOK;
    }
  },

  methods: {
    login() {
      if (!this.username || !this.role) { alert('Enter name and role'); return; }
      this.loggedIn = true;
      this.fetchLessons();
    },

    logout() {
      this.loggedIn = false;
      this.username = '';
      this.role = '';
      this.cart = [];
      this.lessons = [];
    },

    fetchLessons() {
      fetch(`${this.apiBase}/lessons`)
        .then(r => r.json())
        .then(data => { this.lessons = data; })
        .catch(err => console.error('fetch lessons error', err));
    },

    onSearchInput() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.performSearch();
      }, 300);
    },

    performSearch() {
      if (!this.searchText.trim()) {
        this.fetchLessons();
        return;
      }
      const q = encodeURIComponent(this.searchText);
      fetch(`${this.apiBase}/search?q=${q}`)
        .then(r => r.json())
        .then(data => { this.lessons = data; })
        .catch(err => console.error('search error', err));
    },

    applySort() { /* computed handles it */ },

    addToCart(lesson) {
      if (lesson.availableSpace <= 0) return;
      const copy = { ...lesson };
      this.cart.push(copy);
      const idx = this.lessons.findIndex(l => l._id === lesson._id);
      if (idx >= 0) { this.lessons[idx].availableSpace -= 1; }
    },

    removeFromCart(index) {
      const item = this.cart[index];
      const idx = this.lessons.findIndex(l => l._id === item._id);
      if (idx >= 0) { this.lessons[idx].availableSpace += 1; }
      this.cart.splice(index, 1);
    },

    toggleCart() {
      this.orderMessage = '';
      this.showingCart = !this.showingCart;
    },

    viewLesson(lesson) {
      alert(`${lesson.subject}\nLocation: ${lesson.location}\nPrice: £${lesson.price}\nSpaces: ${lesson.availableSpace}`);
    },

    submitOrder() {
      if (!this.canCheckout) return;
      const counts = {};
      this.cart.forEach(c => { counts[c._id] = (counts[c._id] || 0) + 1; });

      const order = {
        name: this.checkoutName,
        phone: this.checkoutPhone,
        lessons: Object.keys(counts).map(id => ({ lessonId: id, qty: counts[id] })),
        createdAt: new Date().toISOString()
      };

      fetch(`${this.apiBase}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      })
      .then(r => { if(!r.ok) throw new Error('Order failed'); return r.json(); })
      .then(saved => {
        const updates = order.lessons.map(l => {
          return fetch(`${this.apiBase}/lessons/${l.lessonId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ $incSpaces: -l.qty })
          }).then(r=>r.json());
        });
        return Promise.all(updates).then(() => saved);
      })
      .then(saved => {
        this.orderMessage = 'Order submitted. Order ID: ' + (saved.insertedId || saved._id || saved.id);
        this.cart = [];
        this.checkoutName = '';
        this.checkoutPhone = '';
        this.fetchLessons();
      })
      .catch(err => { console.error(err); alert('Error submitting order'); });
    }
  }
}).mount('#app');
>>>>>>> 82d3ce3 (Set apiBase to deployed backend URL for GitHub Pages)
