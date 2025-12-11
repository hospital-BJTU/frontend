<template>
    <div class="user-management">
        <h1>用户管理</h1>
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>用户列表</span>
                    <el-button type="primary" @click="handleAddUser">新增用户</el-button>
                </div>
            </template>
            <el-form :inline="true" :model="queryForm" class="search-form">
                <el-form-item label="用户名">
                    <el-input v-model="queryForm.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="角色">
                    <el-select v-model="queryForm.role" placeholder="请选择角色" clearable>
                        <el-option label="管理员" value="admin"></el-option>
                        <el-option label="医生" value="doctor"></el-option>
                        <el-option label="患者" value="patient"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchUsers">查询</el-button>
                    <el-button @click="resetQuery">重置</el-button>
                </el-form-item>
            </el-form>

            <el-table :data="users" v-loading="loading" border style="width: 100%">
                <el-table-column prop="userId" label="ID" width="80"></el-table-column>
                <el-table-column prop="username" label="用户名"></el-table-column>
                <el-table-column prop="role" label="角色">
                    <template #default="scope">
                        <el-tag :type="scope.row.role === 'admin' ? 'danger' : (scope.row.role === 'doctor' ? 'warning' : 'success')">
                            {{ getRoleText(scope.row.role) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="phone" label="手机号"></el-table-column>
                <el-table-column prop="verifyStatus" label="审核状态">
                    <template #default="scope">
                        <el-tag :type="scope.row.verifyStatus === 'verified' ? 'success' : 'info'">
                            {{ getVerifyStatusText(scope.row.verifyStatus) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="创建时间"></el-table-column>
                <el-table-column label="操作" width="280">
                    <template #default="scope">
                        <el-button size="small" @click="handleEditUser(scope.row)">编辑</el-button>
                        <el-button size="small" type="warning" @click="handleResetPassword(scope.row)">重置密码</el-button>
                        <el-button size="small" type="danger" @click="handleDeleteUser(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handlePageChange"
                :current-page="pagination.page"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="pagination.limit"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalUsers">
            </el-pagination>
        </el-card>

        <!-- 新增/编辑用户弹窗 -->
        <el-dialog
            :title="isEditMode ? '编辑用户' : '新增用户'"
            v-model="dialogVisible"
            width="40%">
            <el-form :model="currentUser" ref="userFormRef" label-width="80px">
                <el-form-item
                    label="用户名"
                    prop="username"
                    :rules="[{ required: true, message: '用户名不能为空', trigger: 'blur' }]"
                >
                    <el-input v-model="currentUser.username"></el-input>
                </el-form-item>
                <el-form-item
                    v-if="!isEditMode"
                    label="密码"
                    prop="password"
                    :rules="[{ required: true, message: '密码不能为空', trigger: 'blur' }]"
                >
                    <el-input type="password" v-model="currentUser.password"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="currentUser.phone"></el-input>
                </el-form-item>
                <el-form-item label="角色" prop="role">
                    <el-select v-model="currentUser.role" placeholder="请选择角色">
                        <el-option label="管理员" value="admin"></el-option>
                        <el-option label="医生" value="doctor"></el-option>
                        <el-option label="患者" value="patient"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitUserForm">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 重置密码弹窗 -->
        <el-dialog
            title="重置密码"
            v-model="resetPasswordDialogVisible"
            width="30%">
            <el-form :model="resetPasswordForm" ref="resetPasswordFormRef" label-width="100px">
                <el-form-item label="新密码" prop="newPassword" :rules="[{ required: true, message: '新密码不能为空', trigger: 'blur' }]">
                    <el-input type="password" v-model="resetPasswordForm.newPassword"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitResetPasswordForm">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import request from '@/api/request';
import { ElMessage, ElMessageBox } from 'element-plus';

const users = ref([]);
const loading = ref(false);
const totalUsers = ref(0);
const pagination = reactive({
    page: 1,
    limit: 10,
});
const queryForm = reactive({
    username: '',
    role: '',
});

const dialogVisible = ref(false);
const isEditMode = ref(false);
const currentUser = reactive({
    userId: null,
    username: '',
    password: '',
    phone: '',
    role: 'patient', // 默认角色
});
const userFormRef = ref(null);

const resetPasswordDialogVisible = ref(false);
const resetPasswordForm = reactive({
    userId: null,
    newPassword: '',
});
const resetPasswordFormRef = ref(null);

// 角色文本映射
const getRoleText = (role) => {
    switch (role) {
        case 'admin': return '管理员';
        case 'doctor': return '医生';
        case 'patient': return '患者';
        default: return '未知';
    }
};

// 审核状态文本映射
const getVerifyStatusText = (status) => {
    switch (status) {
        case 'verified': return '已审核';
        case 'unverified': return '未审核';
        default: return '未知';
    }
};

// 获取用户列表
const fetchUsers = async () => {
    loading.value = true;
    try {
        const params = {
            page: pagination.page,
            limit: pagination.limit,
            username: queryForm.username,
            role: queryForm.role,
        };
        const response = await request.get('/admin/users', { params });
        if (response.code === 200) {
            users.value = response.data.list;
            totalUsers.value = response.data.total;
        }
    } catch (error) {
        console.error('获取用户列表失败:', error);
        ElMessage.error('获取用户列表失败');
    } finally {
        loading.value = false;
    }
};

// 处理分页大小变化
const handleSizeChange = (newSize) => {
    pagination.limit = newSize;
    fetchUsers();
};

// 处理页码变化
const handlePageChange = (newPage) => {
    pagination.page = newPage;
    fetchUsers();
};

// 重置查询条件
const resetQuery = () => {
    queryForm.username = '';
    queryForm.role = '';
    pagination.page = 1;
    fetchUsers();
};

// 新增用户按钮点击
const handleAddUser = () => {
    isEditMode.value = false;
    Object.assign(currentUser, {
        userId: null,
        username: '',
        password: '',
        phone: '',
        role: 'patient',
    });
    dialogVisible.value = true;
    if (userFormRef.value) {
        userFormRef.value.resetFields();
    }
};

// 编辑用户按钮点击
const handleEditUser = (row) => {
    isEditMode.value = true;
    Object.assign(currentUser, {
        userId: row.userId,
        username: row.username,
        phone: row.phone,
        role: row.role,
        password: '', // 编辑时不显示密码，也不提交密码字段
    });
    dialogVisible.value = true;
};

// 提交新增/编辑用户表单
const submitUserForm = () => {
    userFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                if (isEditMode.value) {
                    // 编辑
                    const payload = {
                        username: currentUser.username,
                        phone: currentUser.phone,
                        role: currentUser.role,
                    };
                    const response = await request.put(`/admin/users/${currentUser.userId}`, payload); // 修改请求路径，移除多余的 /api
                    if (response.code === 200) {
                        ElMessage.success('用户信息更新成功');
                        dialogVisible.value = false;
                        fetchUsers();
                    }
                } else {
                    // 新增
                    const payload = {
                        username: currentUser.username,
                        password: currentUser.password,
                        phone: currentUser.phone,
                        role: currentUser.role,
                    };
                    const response = await request.post('/admin/users', payload); // 修改请求路径，移除多余的 /api
                    if (response.code === 201) {
                        ElMessage.success('用户创建成功');
                        dialogVisible.value = false;
                        fetchUsers();
                    }
                }
            } catch (error) {
                console.error('提交用户表单失败:', error);
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : '操作失败';
                ElMessage.error(errorMessage);
            }
        }
    });
};

// 重置密码按钮点击
const handleResetPassword = (row) => {
    resetPasswordForm.userId = row.userId;
    resetPasswordForm.newPassword = '';
    resetPasswordDialogVisible.value = true;
    if (resetPasswordFormRef.value) {
        resetPasswordFormRef.value.resetFields();
    }
};

// 提交重置密码表单
const submitResetPasswordForm = () => {
    resetPasswordFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const response = await request.put(`/admin/users/${resetPasswordForm.userId}/password`, { // 修改请求路径，移除多余的 /api
                    newPassword: resetPasswordForm.newPassword,
                });
                if (response.code === 200) {
                    ElMessage.success('密码重置成功');
                    resetPasswordDialogVisible.value = false;
                }
            } catch (error) {
                console.error('重置密码失败:', error);
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : '操作失败';
                ElMessage.error(errorMessage);
            }
        }
    });
};

// 删除用户
const handleDeleteUser = (row) => {
    ElMessageBox.confirm(`确定删除用户 "${row.username}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            try {
                const response = await request.delete(`/admin/users/${row.userId}`); // 修改请求路径，移除多余的 /api
                if (response.code === 200) {
                    ElMessage.success('用户删除成功');
                    fetchUsers();
                }
            } catch (error) {
                console.error('删除用户失败:', error);
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : '删除失败';
                ElMessage.error(errorMessage);
            }
        })
        .catch(() => {
            ElMessage.info('已取消删除');
        });
};

onMounted(() => {
    fetchUsers();
});
</script>

<style scoped>
.user-management {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-form {
    margin-bottom: 20px;
}

.el-pagination {
    margin-top: 20px;
    justify-content: flex-end;
}
</style>
