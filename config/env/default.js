'use strict'

module.exports = {
  app: {
    title: 'MEAN.JS',
    description: 'Sellr Dashboard allows you to edit and manage your store. For more information checkout http://getsellr.com',
    keywords: 'oncue,sellr,wine,beer,spirits,marketing',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID',
    STRIPE_PUBLISH_KEY: process.env.STRIPE_PUBLISH_KEY || 'pk_test_8eCwGxyRav2xemiMy666CWXT', // test api key
    SUBSCRIPTION_PRICE: process.env.SUBSCRIPTION_PRICE || '0.50 USD', // minimum value
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'cdn.expertoncue.com',
    AWS_S3_REGION: process.env.AWS_S3_REGION || 'us-east-1',
    AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY || 'AKIAICAP7UIWM4XZWVBA',
    AWS_SECRET_KEY: process.env.AWS_SECRET_KEY || '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',
    FILEPICKER_KEY: process.env.FILEPICKER_KEY || 'ADpK7klw2ThCd2by8scXHz'
  },
  port: process.env.PORT || 3000,
  templateEngine: 'swig',
  // Session Cookie settings
  sessionCookie: {
    // session expiration is set by default to 24 hours
    maxAge: 24 * (60 * 60 * 1000),
    // httpOnly flag makes sure the cookie is only accessed
    // through the HTTP protocol and not JS/browser
    httpOnly: true,
    // secure cookie should be turned to true to provide additional
    // layer of security so that the cookie is set only when working
    // in HTTPS mode.
    secure: false
  },
  // sessionSecret should be changed for security measures and concerns
  sessionSecret: process.env.SESSION_SECRET || 'MEAN',
  // sessionKey is set to the generic sessionId key used by PHP applications
  // for obsecurity reasons
  sessionKey: 'sessionId',
  sessionCollection: 'sessions',
  logo: 'modules/core/client/img/brand/logo.png',
  favicon: 'modules/core/client/img/brand/favicon.ico',
  uploads: {
    profileUpload: {
      dest: './modules/users/client/img/profile/uploads/', // Profile upload destination path
      limits: {
        fileSize: 1 * 1024 * 1024 // Max file size in bytes (1 MB)
      }
    }
  }
}
