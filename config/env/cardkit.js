'use strict'

module.exports = {
  cardkit: {
    credentials: {
      aws: {
        accessKeyId: process.env.CARDKIT_AWS_ACCESS_KEY || 'AKIAIUIQPRSPRAZRA2FA',
        secretAccessKey: process.env.CARDKIT_AWS_SECRET_KEY || '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',
        bucket: process.env.CARDKIT_AWS_S3_BUCKET || 'cdn.cardkit.io',
        region: process.env.CARDKIT_AWS_REGION || 'us-east-1',
        cdn_url: process.env.CARDKIT_AWS_CDN_URL || 'https://cdn.cardkit.io'
      },
      filepicker: {
        key: process.env.CARDKIT_FILEPICKER_KEY || 'AE03RoZaQ1e5tyAaGAL2gz'
      },
      intercom: {
        appId: process.env.CARDKIT_INTERCOM_APP_ID || ''
      },
      iframely: {
        apiKey: process.env.CARDKIT_IFRAMELY_API_KEY || '2d78c263b01d3413bf50d3'
      }
    }
  }
}
