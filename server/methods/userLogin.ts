import { db, sha256 } from '../../lib';

export const userLogin = async (body: any) => {
  body.password = sha256(body.password);
  let { username, password } = body;

  if (!username || !password) {
    return { error: '用户名或密码不能为空' };
  }

  const col = db().collection('users');

  const oldUser = await col.findOne({ username: { $eq: username } });

  if (!oldUser) {
    const nextUser = await col.insertOne({ ...body, token: sha256(Date.now() + password), createAt: Date.now() });

    return { msg: '注册新账号成功', token: nextUser.ops[0].token };
  }

  if (oldUser.password === password) {
    return { msg: '登录成功', token: oldUser.token };
  }

  return { msg: '用户名或密码错误' };
};

export const userLoginWithToken = async (body: any) => {
  let { token } = body;

  if (!token) {
    return { error: '免密登录失败, 请重新登录' };
  }

  const col = db().collection('users');

  const user = await col.findOne({ token: { $eq: token } });

  if (!user) {
    return { error: '免密登录失败, 请重新登录' };
  }

  const nextToken = sha256(Date.now() + token);

  const nextUser = await col.updateOne(
    { _id: { $eq: user._id } },
    { $set: { token: nextToken, updateAt: Date.now() } },
  );

  if (nextUser.result.n === 1) {
    return { msg: '欢迎回来', token: nextToken };
  }

  return { msg: '免密登录失败, 请重新登录' };
};
