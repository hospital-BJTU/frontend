<template>
    <div class="doctor-management">
        <h1>医生管理</h1>
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>医生列表</span>
                    <el-button type="primary" @click="handleAddDoctor">新增医生</el-button>
                </div>
            </template>
            <el-form :inline="true" :model="queryForm" class="search-form">
                <el-form-item label="用户名">
                    <el-input v-model="queryForm.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="科室">
                    <el-select v-model="queryForm.deptId" placeholder="请选择科室" clearable>
                        <el-option
                            v-for="dept in departments"
                            :key="dept.deptId"
                            :label="dept.deptName"
                            :value="dept.deptId">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="职称">
                    <el-input v-model="queryForm.title" placeholder="请输入职称"></el-input>
                </el-form-item>
                <el-form-item label="审核状态">
                    <el-select v-model="queryForm.verifyStatus" placeholder="请选择状态" clearable>
                        <el-option label="已审核" value="verified"></el-option>
                        <el-option label="未审核" value="unverified"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchDoctors">查询</el-button>
                    <el-button @click="resetQuery">重置</el-button>
                </el-form-item>
            </el-form>

            <el-table :data="doctors" v-loading="loading" border style="width: 100%">
                <el-table-column prop="doctorId" label="医生ID" width="80"></el-table-column>
                <el-table-column prop="User.username" label="用户名"></el-table-column>
                <el-table-column prop="Department.dept_name" label="科室"></el-table-column>
                <el-table-column prop="title" label="职称"></el-table-column>
                <el-table-column prop="User.phone" label="手机号"></el-table-column>
                <el-table-column prop="User.verifyStatus" label="审核状态">
                    <template #default="scope">
                        <el-tag :type="scope.row.User.verifyStatus === 'verified' ? 'success' : 'info'">
                            {{ getVerifyStatusText(scope.row.User.verifyStatus) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="User.created_at" label="创建时间"></el-table-column>
                <el-table-column label="操作" width="300">
                    <template #default="scope">
                        <el-button size="small" @click="handleEditDoctor(scope.row)">编辑</el-button>
                        <el-button
                            size="small"
                            :type="scope.row.User.verifyStatus === 'verified' ? 'info' : 'success'"
                            @click="handleAuditDoctor(scope.row)"
                        >
                            {{ scope.row.User.verifyStatus === 'verified' ? '取消审核' : '审核通过' }}
                        </el-button>
                        <el-button size="small" type="danger" @click="handleDeleteDoctor(scope.row)">删除</el-button>
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
                :total="totalDoctors">
            </el-pagination>
        </el-card>

        <!-- 新增/编辑医生弹窗 -->
        <el-dialog
            :title="isEditMode ? '编辑医生' : '新增医生'"
            v-model="dialogVisible"
            width="40%">
            <el-form :model="currentDoctor" ref="doctorFormRef" label-width="80px">
                <el-form-item
                    label="用户名"
                    prop="username"
                    :rules="[{ required: true, message: '用户名不能为空', trigger: 'blur' }]"
                >
                    <el-input v-model="currentDoctor.username"></el-input>
                </el-form-item>
                <el-form-item
                    v-if="!isEditMode"
                    label="密码"
                    prop="password"
                    :rules="[{ required: true, message: '密码不能为空', trigger: 'blur' }]"
                >
                    <el-input type="password" v-model="currentDoctor.password"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="currentDoctor.phone"></el-input>
                </el-form-item>
                <el-form-item label="科室" prop="deptId" :rules="[{ required: true, message: '请选择科室', trigger: 'change' }]">
                    <el-select v-model="currentDoctor.deptId" placeholder="请选择科室">
                        <el-option
                            v-for="dept in departments"
                            :key="dept.deptId"
                            :label="dept.deptName"
                            :value="dept.deptId">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="职称" prop="title" :rules="[{ required: true, message: '职称不能为空', trigger: 'blur' }]">
                    <el-input v-model="currentDoctor.title"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitDoctorForm">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import request from '@/api/request';
import { ElMessage, ElMessageBox } from 'element-plus';

const doctors = ref([]);
const departments = ref([]); // 用于存储科室列表，供选择
const loading = ref(false);
const totalDoctors = ref(0);
const pagination = reactive({
    page: 1,
    limit: 10,
});
const queryForm = reactive({
    username: '',
    deptId: null,
    title: '',
    verifyStatus: '',
});

const dialogVisible = ref(false);
const isEditMode = ref(false);
const currentDoctor = reactive({
    doctorId: null,
    username: '',
    password: '',
    phone: '',
    deptId: null,
    title: '',
});
const doctorFormRef = ref(null);

// 审核状态文本映射
const getVerifyStatusText = (status) => {
    switch (status) {
        case 'verified': return '已审核';
        case 'unverified': return '未审核';
        default: return '未知';
    }
};

// 获取科室列表（用于医生新增/编辑的下拉框）
const fetchDepartments = async () => {
    try {
        // 假设科室列表接口不分页，或者返回全部科室
        const response = await request.get('/admin/departments', { params: { limit: 999 } }); 
        if (response.code === 200) {
            departments.value = response.data.list;
        }
    } catch (error) {
        console.error('获取科室列表失败:', error);
        ElMessage.error('获取科室列表失败');
    }
};

// 获取医生列表
const fetchDoctors = async () => {
    loading.value = true;
    try {
        const params = {
            page: pagination.page,
            limit: pagination.limit,
            // 后端接口文档未明确分页和搜索参数，此处为假设
            username: queryForm.username || undefined,
            deptId: queryForm.deptId || undefined,
            title: queryForm.title || undefined,
            verifyStatus: queryForm.verifyStatus || undefined,
        };
        const response = await request.get('/admin/doctors', { params }); // 修改请求路径，移除多余的 /api
        if (response.code === 200) {
            // 假设后端返回的数据结构与科室管理类似，包含 list 和 total
            // 如果后端只返回数组，需要手动分页处理
            doctors.value = response.data.list || response.data; 
            totalDoctors.value = response.data.total || doctors.value.length; // 如果没有total字段，则使用当前数据长度
        }
    } catch (error) {
        console.error('获取医生列表失败:', error);
        ElMessage.error('获取医生列表失败');
    } finally {
        loading.value = false;
    }
};

// 处理分页大小变化
const handleSizeChange = (newSize) => {
    pagination.limit = newSize;
    fetchDoctors();
};

// 处理页码变化
const handlePageChange = (newPage) => {
    pagination.page = newPage;
    fetchDoctors();
};

// 重置查询条件
const resetQuery = () => {
    queryForm.username = '';
    queryForm.deptId = null;
    queryForm.title = '';
    queryForm.verifyStatus = '';
    pagination.page = 1;
    fetchDoctors();
};

// 新增医生按钮点击
const handleAddDoctor = async () => {
    isEditMode.value = false;
    Object.assign(currentDoctor, {
        doctorId: null,
        username: '',
        password: '',
        phone: '',
        deptId: null,
        title: '',
    });
    dialogVisible.value = true;
    if (doctorFormRef.value) {
        doctorFormRef.value.resetFields();
    }
    await fetchDepartments(); // 确保获取到最新的科室列表
};

// 编辑医生按钮点击
const handleEditDoctor = async (row) => {
    isEditMode.value = true;
    Object.assign(currentDoctor, {
        doctorId: row.doctorId,
        username: row.User.username,
        phone: row.User.phone,
        deptId: row.deptId,
        title: row.title,
        password: '', // 编辑时不显示密码，也不提交密码字段
    });
    dialogVisible.value = true;
    await fetchDepartments(); // 确保获取到最新的科室列表
};

// 提交新增/编辑医生表单
const submitDoctorForm = () => {
    doctorFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                if (isEditMode.value) {
                    // 编辑
                    const payload = {
                        title: currentDoctor.title,
                        deptId: currentDoctor.deptId,
                    };
                    const response = await request.put(`/admin/doctors/${currentDoctor.doctorId}`, payload); // 将 doctor_id 改为 doctorId
                    if (response.code === 200) {
                        ElMessage.success('医生信息更新成功');
                        dialogVisible.value = false;
                        fetchDoctors();
                    }
                } else {
                    // 新增
                    const payload = {
                        username: currentDoctor.username,
                        password: currentDoctor.password,
                        phone: currentDoctor.phone,
                        deptId: currentDoctor.deptId,
                        title: currentDoctor.title,
                    };
                    const response = await request.post('/admin/doctors', payload); // 修改请求路径，移除多余的 /api
                    if (response.code === 201) {
                        ElMessage.success('医生创建成功');
                        dialogVisible.value = false;
                        fetchDoctors();
                    }
                }
            } catch (error) {
                console.error('提交医生表单失败:', error);
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : '操作失败';
                ElMessage.error(errorMessage);
            }
        }
    });
};

// 删除医生
const handleDeleteDoctor = (row) => {
    ElMessageBox.confirm(`确定删除医生 "${row.User.username}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            try {
                const response = await request.delete(`/admin/doctors/${row.doctorId}`); // 将 doctor_id 改为 doctorId
                if (response.code === 200) {
                    ElMessage.success('医生删除成功');
                    fetchDoctors();
                }
            } catch (error) {
                console.error('删除医生失败:', error);
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : '删除失败';
                ElMessage.error(errorMessage);
            }
        })
        .catch(() => {
            ElMessage.info('已取消删除');
        });
};

// 审核医生
const handleAuditDoctor = (row) => {
    const newStatus = row.User.verifyStatus === 'verified' ? 'unverified' : 'verified';
    const confirmText = newStatus === 'verified' ? `确定审核通过医生 "${row.User.username}" 吗？` : `确定取消审核医生 "${row.User.username}" 吗？`;

    ElMessageBox.confirm(confirmText, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            try {
                const response = await request.put(`/admin/doctors/${row.doctorId}/audit`, {
                    verifyStatus: newStatus,
                });
                if (response.code === 200) {
                    ElMessage.success(`${newStatus === 'verified' ? '审核通过' : '取消审核'}成功`);
                    fetchDoctors();
                }
            } catch (error) {
                console.error('审核医生失败:', error);
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : '操作失败';
                ElMessage.error(errorMessage);
            }
        })
        .catch(() => {
            ElMessage.info('已取消操作');
        });
};

onMounted(() => {
    fetchDepartments(); // 页面加载时获取科室列表
    fetchDoctors();
});
</script>

<style scoped>
.doctor-management {
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
