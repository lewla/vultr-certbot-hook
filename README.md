```
certbot renew --manual \
--manual-auth-hook "vultr-certbot-hook create" \
--manual-cleanup-hook "vultr-certbot-hook cleanup" \
--preferred-challenges=dns \
--post-hook "systemctl reload nginx"
```