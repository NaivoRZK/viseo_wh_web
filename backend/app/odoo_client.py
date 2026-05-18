import xmlrpc.client
from .config import Config

class OdooClient:
    def __init__(self):
        self.url = Config.ODOO_URL
        self.db = Config.ODOO_DB
        self.common = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/common')
        self.models = None

    def authenticate(self, login, password):
        uid = self.common.authenticate(self.db, login, password, {})
        return uid

    def get_user_by_uid(self, uid, password):
        self.models = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/object')
        users = self.models.execute_kw(
            self.db, uid, password, 'res.users', 'search_read',
            [[['id', '=', uid]]],
            {'fields': ['login', 'name', 'email', 'pin_code']}
        )
        return users[0] if users else None

    def get_user_by_pin(self, pin):
        service_uid = self.common.authenticate(
            self.db, Config.ODOO_SERVICE_USER, Config.ODOO_SERVICE_PASSWORD, {}
        )
        if not service_uid:
            return None
        self.models = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/object')
        users = self.models.execute_kw(
            self.db, service_uid, Config.ODOO_SERVICE_PASSWORD, 'res.users', 'search_read',
            [[['pin_code', '=', pin]]],
            {'fields': ['login', 'name', 'email', 'pin_code', 'id']}
        )
        return users[0] if users else None

    def get_user_by_id(self, uid):
        service_uid = self.common.authenticate(
            self.db, Config.ODOO_SERVICE_USER, Config.ODOO_SERVICE_PASSWORD, {}
        )
        if not service_uid:
            return None
        self.models = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/object')
        users = self.models.execute_kw(
            self.db, service_uid, Config.ODOO_SERVICE_PASSWORD, 'res.users', 'search_read',
            [[['id', '=', uid]]],
            {'fields': ['login', 'name', 'email', 'id']}
        )
        return users[0] if users else None
