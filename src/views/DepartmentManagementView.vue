<template>
    <div class="department-management">
        <h1>科室管理</h1>
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>科室列表</span>
                    <el-button type="primary" @click="handleAddDepartment">新增科室</el-button>
                </div>
            </template>
            <el-form :inline="true" :model="queryForm" class="search-form">
                <el-form-item label="科室名称">
                    <el-input v-model="queryForm.keyword" placeholder="请输入科室名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchDepartments">查询</el-button>
                    <el-button @click="resetQuery">重置</el-button>
                </el-form-item>
            </el-form>

            <el-table :data="departments" v-loading="loading" border style="width: 100%">
                <el-table-column prop="deptId" label="ID" width="80"></el-table-column>
                <el-table-column prop="deptName" label="科室名称"></el-table-column>
                <el-table-column label="操作" width="180">
                    <template #default="scope">
                        <el-button size="small" @click="handleEditDepartment(scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDeleteDepartment(scope.row)">删除</el-button>
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
                :total="totalDepartments">
            </el-pagination>
        </el-card>

        <!-- 新增/编辑科室弹窗 -->
        <el-dialog
            :title="isEditMode ? '编辑科室' : '新增科室'"
            v-model="dialogVisible"
            width="30%">
            <el-form :model="currentDepartment" ref="departmentFormRef" label-width="80px">
                <el-form-item
                    label="科室名称"
                    prop="deptName"
                    :rules="[{ required: true, message: '科室名称不能为空', trigger: 'blur' }]"
                >
                    <el-input v-model="currentDepartment.deptName"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitDepartmentForm">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import request from '@/api/request';
import { ElMessage, ElMessageBox } from 'element-plus';

const departments = ref([]);
const loading = ref(false);
const totalDepartments = ref(0);
const pagination = reactive({
    page: 1,
    limit: 10,
});
const queryForm = reactive({
    keyword: '',
});

const dialogVisible = ref(false);
const isEditMode = ref(false);
const currentDepartment = reactive({
    deptId: null,
    deptName: '',
});
const departmentFormRef = ref(null);

// 获取科室列表
const fetchDepartments = async () => {
    loading.value = true;
    try {
        const params = {
            page: pagination.page,
            limit: pagination.limit,
        };
        if (queryForm.keyword) {
            params.keyword = queryForm.keyword;
        }
        const response = await request.get('/admin/departments', { params }); // 修改请求路径
        if (response.code === 200) {
            departments.value = response.data.list;
            totalDepartments.value = response.data.total;
        }
    } catch (error) {
        console.error('获取科室列表失败:', error);
        ElMessage.error('获取科室列表失败');
    } finally {
        loading.value = false;
    }
};

// 处理分页大小变化
const handleSizeChange = (newSize) => {
    pagination.limit = newSize;
    fetchDepartments();
};

// 处理页码变化
const handlePageChange = (newPage) => {
    pagination.page = newPage;
    fetchDepartments();
};

// 重置查询条件
const resetQuery = () => {
    queryForm.keyword = '';
    pagination.page = 1;
    fetchDepartments();
};

// 新增科室按钮点击
const handleAddDepartment = () => {
    isEditMode.value = false;
    currentDepartment.deptId = null;
    currentDepartment.deptName = '';
    dialogVisible.value = true;
    if (departmentFormRef.value) {
        departmentFormRef.value.resetFields();
    }
};

// 编辑科室按钮点击
const handleEditDepartment = (row) => {
    isEditMode.value = true;
    currentDepartment.deptId = row.deptId;
    currentDepartment.deptName = row.deptName;
    dialogVisible.value = true;
};

// 提交新增/编辑科室表单
const submitDepartmentForm = () => {
    departmentFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                if (isEditMode.value) {
                    // 编辑
                    const response = await request.put(`/admin/departments/${currentDepartment.deptId}`, { // 修改请求路径
                        deptName: currentDepartment.deptName,
                    });
                    if (response.code === 200) {
                        ElMessage.success('科室更新成功');
                        dialogVisible.value = false;
                        fetchDepartments();
                    }
                } else {
                    // 新增
                    const response = await request.post('/admin/departments', { // 修改请求路径
                        deptName: currentDepartment.deptName,
                    });
                    if (response.code === 201) {
                        ElMessage.success('科室创建成功');
                        dialogVisible.value = false;
                        fetchDepartments();
                    }
                }
            } catch (error) {
                console.error('提交科室表单失败:', error);
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : '操作失败';
                ElMessage.error(errorMessage);
            }
        }
    });
};

// 删除科室
const handleDeleteDepartment = (row) => {
    ElMessageBox.confirm(`确定删除科室 "${row.deptName}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            try {
                const response = await request.delete(`/admin/departments/${row.deptId}`); // 修改请求路径
                if (response.code === 200) {
                    ElMessage.success('科室删除成功');
                    fetchDepartments();
                }
            } catch (error) {
                console.error('删除科室失败:', error);
                const errorMessage = error.response && error.response.data && error.response.data.message ? error.response.data.message : '删除失败';
                ElMessage.error(errorMessage);
            }
        })
        .catch(() => {
            ElMessage.info('已取消删除');
        });
};

onMounted(() => {
    fetchDepartments();
});
</script>

<style scoped>
.department-management {
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
