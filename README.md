# OptimusCredit React Frontend

This is the React frontend migration of the OptimusCredit financial analysis platform, replacing the previous Streamlit interface.

## 🚀 Features

- **Modern React with TypeScript**: Type-safe development
- **Material-UI (MUI)**: Professional banking-focused design
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Financial Tables**: Properly styled with right-aligned numbers and centered headers
- **Interactive Charts**: Data visualization with Recharts
- **File Upload**: Drag-and-drop Excel file import
- **Professional Reports**: PDF and Excel export functionality

## 🏗️ Architecture

### Pages
- **HomePage**: Welcome page with feature overview
- **UploadPage**: Excel file upload with drag-and-drop
- **AnalysisPage**: Detailed financial analysis with tabbed interface
- **ReportsPage**: Report generation with customizable options
- **SettingsPage**: Application settings and information

### Components
- **Header**: Top navigation with branding
- **Sidebar**: Side navigation menu
- **FinancialTable**: Specialized component for financial data display

### Features Fixed from Streamlit
- ✅ **Table Alignment**: Year headers are centered, numbers are right-aligned
- ✅ **Professional Styling**: Banking-focused color scheme and typography
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Better UX**: Smooth navigation and interactions

## 🎨 Design System

### Colors
- **Primary**: `#1f4e79` (Deep blue - trust and stability)
- **Secondary**: `#2c5aa0` (Medium blue)
- **Success**: `#27ae60` (Green - positive indicators)
- **Warning**: `#f39c12` (Orange - warnings)
- **Error**: `#e74c3c` (Red - errors/alerts)

### Typography
- **Headers**: Roboto, bold weights for hierarchy
- **Financial Numbers**: Roboto Mono for tabular alignment
- **Body Text**: Roboto for readability

## 🔧 Installation

```bash
cd optimus-react
npm install
npm start
```

## 📱 Responsive Breakpoints

- **Mobile**: < 600px
- **Tablet**: 600px - 900px
- **Desktop**: > 900px

## 🔄 Migration from Streamlit

This React app replaces the Streamlit version with:

1. **Better Performance**: Faster rendering and interactions
2. **Professional UI**: Banking-grade interface design
3. **Mobile Support**: Full responsive design
4. **Customizable**: Easy to extend and modify
5. **Integration Ready**: Prepared for Django backend integration

## 🎯 Next Steps

1. **Backend Integration**: Connect to Django REST API
2. **Authentication**: Add user login/logout
3. **Real File Processing**: Integrate with actual Excel parsing
4. **Charts Integration**: Add interactive financial charts
5. **PWA Features**: Add offline capabilities

## 🏢 Production Deployment

The app is built with production deployment in mind:

```bash
npm run build
```

This creates an optimized build in the `build/` folder ready for deployment to any static hosting service or integrated with Django templates.

## 📞 Support

For technical support, contact: support@kaizen-corporation.com

---

© 2025 Kaizen Business Support - Tous droits réservés