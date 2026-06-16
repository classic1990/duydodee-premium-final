# 📊 Analytics & Reporting System Documentation

## Overview

DUYดูDEE PREMIUM includes a comprehensive analytics and reporting system for tracking user behavior, content performance, and system health.

---

## 🚀 Quick Start

### Initialize Analytics
```javascript
import { Analytics } from '/src/utils/analytics-reporting.js';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    Analytics.init();
});
```

### Track Custom Events
```javascript
// Track user action
Analytics.trackAction('button_click', {
    buttonId: 'subscribe-btn',
    location: 'hero-section'
});

// Track content view
Analytics.trackContentView('movie123', 'movie', 120); // 120 seconds watched

// Track search
Analytics.trackSearch('action movies', 15); // 15 results
```

### Generate Reports
```javascript
import { Reports } from '/src/utils/analytics-reporting.js';

// Get comprehensive report
const report = Reports.generateReport();
console.log(report);

// Export report to JSON
Reports.exportReport();
```

---

## 📋 Tracking Capabilities

### Built-in Automatic Tracking
- ✅ Page views
- ✅ Device information
- ✅ Performance metrics
- ✅ Click events on interactive elements
- ✅ Scroll depth
- ✅ Page visibility
- ✅ JavaScript errors
- ✅ Promise rejections

### Manual Tracking
- ✅ User actions
- ✅ Content views
- ✅ Search queries
- ✅ Custom events
- ✅ Errors

---

## 🎯 Analytics Features

### Page View Tracking
Automatically tracks:
- Current page path
- Page title
- Referrer URL
- Timestamp

### Device Information Tracking
Collects:
- User agent
- Language
- Platform
- Screen resolution
- Viewport size
- Connection type (if available)

### Performance Tracking
Monitors:
- Page load time
- DOM ready time
- First paint time
- Navigation timing

### User Action Tracking
Tracks:
- Button clicks
- Link clicks
- Card interactions
- Form submissions
- Scroll depth (25%, 50%, 75%, 90%)

### Content View Tracking
Records:
- Content ID
- Content type (movie/series)
- Watch duration
- Timestamp

### Search Tracking
Logs:
- Search query
- Results count
- Timestamp

### Error Tracking
Captures:
- Error message
- Stack trace
- Context information
- Page URL
- Timestamp

---

## 📈 Reporting Features

### Daily Active Users
```javascript
const dailyUsers = Reports.getDailyActiveUsers();
console.log(`Daily Active Users: ${dailyUsers}`);
```

### Most Viewed Content
```javascript
const topContent = Reports.getMostViewedContent(10);
console.log('Top 10 Content:', topContent);
```

### Search Analytics
```javascript
const searchAnalytics = Reports.getSearchAnalytics();
console.log('Top Search Queries:', searchAnalytics);
```

### Error Report
```javascript
const errorReport = Reports.getErrorReport();
console.log('Error Summary:', errorReport);
```

### Performance Report
```javascript
const perfReport = Reports.getPerformanceReport();
console.log('Performance Metrics:', perfReport);
```

### User Action Report
```javascript
const actionReport = Reports.getUserActionReport();
console.log('User Actions:', actionReport);
```

### Comprehensive Report
```javascript
const fullReport = Reports.generateReport();
console.log('Full Analytics Report:', fullReport);
```

---

## 💾 Data Storage

### LocalStorage Keys
- `analytics_pageViews` - Page view history
- `analytics_userActions` - User action history
- `analytics_contentViews` - Content view history
- `analytics_searches` - Search query history
- `analytics_errors` - Error history
- `analytics_performance` - Performance metrics
- `deviceInfo` - Device information

### Data Retention
- Maximum 100 items per category
- Old data automatically removed
- Prevents storage overflow

---

## 🔧 Configuration

### Customize Tracking
```javascript
// Add custom event listener
document.addEventListener('customEvent', (e) => {
    Analytics.trackAction('custom_event', {
        data: e.detail
    });
});
```

### Disable Specific Tracking
```javascript
// Comment out unwanted tracking in Analytics.setupEventListeners()
```

### Clear Analytics Data
```javascript
Analytics.clearData();
```

---

## 🔌 Integration with External Services

### Firebase Analytics
```javascript
// In production, integrate with Firebase Analytics
const { firebase } = await import('../services/firebase-config.js');

Analytics.logEvent = (eventName, data) => {
    console.log(`📊 [Analytics] ${eventName}:`, data);
    
    // Send to Firebase Analytics
    firebase.analytics().logEvent(eventName, data);
};
```

### Google Analytics
```javascript
// Integrate with Google Analytics
window.gtag('event', eventName, data);
```

### Custom Analytics Service
```javascript
Analytics.logEvent = (eventName, data) => {
    // Send to your analytics service
    fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, data })
    });
};
```

---

## 📊 Report Structure

### Comprehensive Report Example
```json
{
  "date": "2026-06-16T12:00:00.000Z",
  "dailyActiveUsers": 45,
  "mostViewedContent": [
    { "content": "movie_movie123", "views": 120 },
    { "content": "series_series456", "views": 95 }
  ],
  "searchAnalytics": [
    { "query": "action", "count": 25 },
    { "query": "drama", "count": 18 }
  ],
  "errorReport": {
    "total": 2,
    "byMessage": [
      { "message": "Network Error", "count": 2 }
    ],
    "recent": [...]
  },
  "performanceReport": {
    "avgLoadTime": 1250,
    "avgDomReady": 800,
    "avgFirstPaint": 450,
    "samples": 45
  },
  "userActionReport": [
    { "action": "click", "count": 234 },
    { "action": "scroll_depth", "count": 120 }
  ]
}
```

---

## 🎨 Analytics Dashboard (Future)

### Recommended Dashboard Features
- Real-time user count
- Top content views
- Search query trends
- Error rate monitoring
- Performance metrics
- User engagement metrics
- Conversion tracking

### Dashboard Implementation
```javascript
// Create analytics dashboard
const dashboard = document.getElementById('analytics-dashboard');

function updateDashboard() {
    const report = Reports.generateReport();
    
    dashboard.innerHTML = `
        <div class="stat-card">
            <h3>Daily Users</h3>
            <p>${report.dailyActiveUsers}</p>
        </div>
        <div class="stat-card">
            <h3>Avg Load Time</h3>
            <p>${report.performanceReport.avgLoadTime}ms</p>
        </div>
        <div class="stat-card">
            <h3>Total Errors</h3>
            <p>${report.errorReport.total}</p>
        </div>
        <div class="stat-card">
            <h3>Top Content</h3>
            <ul>
                ${report.mostViewedContent.map(c => 
                    `<li>${c.content}: ${c.views} views</li>`
                ).join('')}
            </ul>
        </div>
    `;
}

// Update dashboard every 30 seconds
setInterval(updateDashboard, 30000);
```

---

## 🔒 Privacy Considerations

### Data Collection
- ✅ No personally identifiable information (PII) collected
- ✅ User data stored locally (localStorage)
- ✅ Data retention limited to 100 items per category
- ✅ No tracking of personal content preferences

### Data Usage
- For performance optimization
- For content improvement
- For error detection
- For system monitoring

### GDPR Compliance
- No tracking without consent
- Local storage only (no server transmission)
- Data can be cleared by user
- Transparent about data collection

---

## 🐛 Troubleshooting

### Analytics Not Recording
**Problem:** Events not being tracked

**Solution:**
- Ensure `Analytics.init()` is called
- Check browser console for errors
- Verify localStorage is enabled
- Check if ad-blocker is blocking tracking

### Data Not Persisting
**Problem:** Data lost after page refresh

**Solution:**
- Check localStorage quota
- Verify browser privacy settings
- Clear old data if storage full

### Performance Impact
**Problem:** Analytics slowing down application

**Solution:**
- Reduce event frequency
- Use debouncing for scroll events
- Implement sampling for high-frequency events

---

## 📚 Best Practices

### Event Naming
- Use snake_case for event names
- Be descriptive but concise
- Use consistent naming conventions

### Data Structure
- Keep event data minimal
- Only track necessary information
- Use numbers for metrics

### Performance
- Batch analytics requests
- Use sampling for high-frequency events
- Cache report results

### Privacy
- Never track PII
- Provide opt-out option
- Clear data on logout
- Follow privacy regulations

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Real-time analytics dashboard
- [ ] User cohort analysis
- [ ] Content recommendation analytics
- [ ] Conversion funnel tracking
- [ ] A/B testing integration
- [ ] Custom event builder
- [ ] Export to CSV/PDF
- [ ] Email reports
- [ ] Alerts for anomalies

### Integration Options
- [ ] Firebase Analytics
- [ ] Google Analytics 4
- [ ] Mixpanel
- [ ] Amplitude
- [ ] Custom analytics service

---

**Last Updated:** 2026-06-16  
**Version:** 1.0.0  
**Status:** Production Ready