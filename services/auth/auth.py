from flask import Response, abort, redirect, request
from flask_login import (
    LoginManager,
    UserMixin,
    current_user,
    login_required,
    login_user,
    logout_user,
)

from bootstrap import create_app
from models import Users

app = create_app()
app.config.update(
    DEBUG=True,
    SECRET_KEY="secret_sauce",

)

login_manager = LoginManager()
login_manager.init_app(app)

# csrf = CSRFProtect()
# csrf.init_app(app)


class User(UserMixin):
    ...


def get_user(user_id: int):
    users = Users.query.all()
    for user in users:
        if int(user.id) == int(user_id):
            return user
    return None


@login_manager.user_loader
def user_loader(id: int):
    user = get_user(id)
    if user:
        user_model = User()
        user_model.id = user.id
        return user_model
    return None


@app.errorhandler(401)
def unauthorized(error):
    return Response("Not authorized"), 401


@app.route("/", methods=["GET", "POST"])
def homepage():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        users = Users.query.all()

        for user in users:
            if user.username == username and user.password == password:
                user_model = User()
                user_model.id = user.id
                login_user(user_model)
                return Response({"Response": "Logged In"}, mimetype='application/json')
            else:
                return abort(401)

    if current_user.is_authenticated:
        return Response({"Response": "Already Authed"}, mimetype='application/json')

    return redirect("http://127.0.0.1:3000/", code=302)


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect("http://127.0.0.1:3000/", code=302)


if __name__ == "__main__":
    app.run(debug=True)
