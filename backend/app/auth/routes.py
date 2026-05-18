from flask import request, jsonify, session
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity,
    set_access_cookies, set_refresh_cookies, unset_jwt_cookies
)
from ..odoo_client import OdooClient

odoo_client = OdooClient()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    login = data.get('login')
    password = data.get('password')

    if not login or not password:
        return jsonify({'error': 'Login and password required'}), 400

    uid = odoo_client.authenticate(login, password)
    if not uid:
        return jsonify({'error': 'Invalid credentials'}), 401

    user = odoo_client.get_user_by_uid(uid, password)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    access_token = create_access_token(identity=str(uid))
    refresh_token = create_refresh_token(identity=str(uid))

    session['user_id'] = uid
    session['login'] = login

    response = jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user['id'],
            'login': user['login'],
            'name': user['name'],
            'email': user['email']
        }
    })
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response, 200

@auth_bp.route('/login-pin', methods=['POST'])
def login_pin():
    data = request.get_json()
    pin = data.get('pin')

    if not pin or len(pin) != 4 or not pin.isdigit():
        return jsonify({'error': 'Valid 4-digit PIN required'}), 400

    user = odoo_client.get_user_by_pin(pin)
    if not user:
        return jsonify({'error': 'Invalid PIN'}), 401

    access_token = create_access_token(identity=str(user['id']))
    refresh_token = create_refresh_token(identity=str(user['id']))

    session['user_id'] = user['id']
    session['login'] = user['login']

    response = jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user['id'],
            'login': user['login'],
            'name': user['name'],
            'email': user['email']
        }
    })
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    return response, 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    response = jsonify({'access_token': new_access_token})
    set_access_cookies(response, new_access_token)
    return response, 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    uid = get_jwt_identity()
    user = odoo_client.get_user_by_id(int(uid))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'user': {
            'id': user['id'],
            'login': user['login'],
            'name': user['name'],
            'email': user['email']
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    response = jsonify({'message': 'Logged out successfully'})
    unset_jwt_cookies(response)
    return response, 200
